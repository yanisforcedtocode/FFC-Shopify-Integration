// === packages
const Typesense = require('typesense')
const asyncWrapper = require('./../../utilities/asyncWrapper')
const csv = require("csvtojson")
const path = require("path")

// === variables
const csvFileName = ""

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

// === format output ===
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
// === restAPI ===
// === addmany classes to index 
exports.addManyProducts = asyncWrapper(async(req, res, next)=>{
    const products = await shopifyAdminAPI.getAllProducts()
    // fit data into schema
    const productsFormated = formatProducts__Col(products)
    const tsRes = await client.collections('sgfitfam_classes_2022').documents().import(productsFormated, {action: 'upsert'})
    // const tsRes = await client.collections('shopify_products_test').documents().upsert(productsFormated[0])
    res.status(200).json({
        status: 200,
        result: productsFormated.length,
        sample: productsFormated[3],
        tsRes: tsRes
    })
})
