import { NextFunction, Response } from "express"

const contentType = require('content-type')
const getRawBody = require('raw-body')


const rawParser = (req: any, res: Response, next: NextFunction)=> {
  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: contentType.parse(req).parameters.charset
  }, function (err: Error, string: string) {
    if (err) return next(err)
    req.text = string
    next()
  })
}

export default rawParser