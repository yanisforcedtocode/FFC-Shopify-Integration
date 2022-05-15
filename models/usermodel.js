const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require('bcrypt')
let currentTime = Date.now();

//schema with 3 fields: email, psw, pswConfirm
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      lowecase: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    psw: {
      type: String,
      required: [true, "A user must have a psw"],
      minlength:8,
      select: false
    },
    pswConfirm: {
      type: String,
      required: [true, "A user must have a valid psw confirmation"],
      minlength:8,
      validate:{
          // This only works on create(), save()
          validator:function(el){
          return el === this.psw;
      }, message:"Passwords are not the same"},
      select: false
    },
    createdAt: {
      type: Date,
      default: currentTime},
    failedCount:{
      type:Number,
      default:0
    },
    activeUser:{
      type: Boolean,
      default: true
    },
    authority:{
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    pswChangedAt: Date
  });

// encrypt psw by bcrypt pre save()
userSchema.pre('save', async function(next){
  try {  
    // Only run this function if password was modified
    if(!this.isModified('psw')) return next();
    // Hash the psw with cost of 12
    this.psw = await bcrypt.hash(this.psw, 12);
    // Delete the pswConfirm field
    this.pswConfirm = undefined;
    this.pswChangedAt = currentTime
    next()
  } catch (error) {
    next(error)
  }
})

// check psw by bcrypt
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}
  
const User = mongoose.model("User", userSchema, "users--passport")

module.exports = User