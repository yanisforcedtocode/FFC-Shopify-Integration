import { AppError } from './../../utilities/appError';
import { logDev } from './../../utilities/logDev';
// import { CustomRequest } from './../../utilities/interfaces'
import { NextFunction, Response } from "express";
const crypto = require('crypto');

const getHash = async (rawBody: any, secretKey: string) => {
  const hash = await crypto
    .createHmac('sha256', secretKey)
    .update(rawBody, 'utf8')
    .digest('base64')
  return hash
}

const parseRawText = (bufferText: any) => {
  const bufferString = bufferText.toString('utf8')
  const object = JSON.parse(bufferString)
  return object
}

const isDomainMatch = (domainHeader: string): boolean=>{
  if (domainHeader === JSON.stringify(process.env.ShopifyDomainLive) || domainHeader === JSON.stringify(process.env.ShopifyDomainDev)){
    logDev('domain verification success')
    return true
  }else{
    logDev('domain verification failed')
    return false
  }
}

const isHashMatch = (headerhmac: string, hash: string)=>{
  if(headerhmac === hash){
    logDev('hashCheck success')
    return true
  }else{
    logDev('hashCheck failed')
    return false
  }
}

export const webHookVerification = async (req: any, res: Response, next: NextFunction) => {
  try {
    // === verification ===
    const getHeaderhmac = req.header('x-shopify-hmac-sha256')
    const shopDomain = req.header('x-shopify-shop-domain')
    const hash = await getHash(req.text, process.env.ShopifyWebHookKey!)
    if(!getHeaderhmac) throw new AppError('No valid hmac in header', 404)
    // Reject failed verifications
    if (!isHashMatch(getHeaderhmac, hash) || !isDomainMatch(JSON.stringify(shopDomain))) {
      console.log("verification failed")
      throw new AppError('Webhook verification error', 401)
    } else {
      logDev('verification successful')
      req.bodyObj = parseRawText(req.text)
      next()
    }
  } catch (error) {
    console.log(error)
  }
}

