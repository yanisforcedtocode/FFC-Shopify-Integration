// === packages
const Typesense = require('typesense')
const asyncWrapper = require('./../../utilities/asyncWrapper')
const csv = require("csvtojson")
const path = require("path")

// === variables
const csvFileName = "FITFAMCO - Programs List 20241119.csv"

// === controllers
// === handlers
const deleteKeys = (keys, obj)=>{
    keys.forEach((el)=>{
        if(obj[el]){
        delete obj[el]
    }
    })
}
const compareKeys = (keys_tags, keys_params)=>{
    const mappedKeys = keys_tags.filter((el)=>{
        return keys_params.includes(el)
    })
    return mappedKeys
}
const loadCsv = async(fileName = csvFileName)=>{
    try{
        const dataArr = await csv().fromFile(path.join(process.cwd(),"utilities","csv",fileName))
        console.log(dataArr[0])
        return dataArr
    }catch(err){console.log(err)}
}
// === format output ===
const formatClasses = (arr)=>{
    const formatedArr = []
    arr.forEach((el_01)=>{
        el_01.Updated = Date.parse(el_01.Updated)
        el_01.Created = Date.parse(el_01.Created)
        formatedArr.push(el_01)
    })
    return formatedArr
}
// === remove HTML from bodyText
function removeHTMLTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}
function removeLineBr(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace( /\n/g, '');
}
// === format data for indexing

// init Typesense client
let client = new Typesense.Client({
  'nodes': [{
    'host': '2y9h70d3prw6uv8jp-1.a1.typesense.net', // For Typesense Cloud use xxx.a1.typesense.net
    'port': '443',      // For Typesense Cloud use 443
    'protocol': 'https'   // For Typesense Cloud use https
  }],
  'apiKey': process.env.TypeSenseADMIN_KEY,
  'connectionTimeoutSeconds': 2
})
// === exports ===
// === addmany classes to index 
exports.addManyClasses = asyncWrapper(async(req, res, next)=>{
    const classes = await loadCsv('FITFAMCO - Programs List 20241119.csv')
    // fit data into schema
    const classesFormated = formatClasses(classes)
    const tsRes = await client.collections('sgfitfam_classes_01').documents().import(classesFormated, {action: 'upsert'})
    res.status(200).json({
        status: 200,
        result: classesFormated.length,
        sample: classesFormated[3],
        tsRes: tsRes,
        tsResLength: tsRes.length
    })
})
