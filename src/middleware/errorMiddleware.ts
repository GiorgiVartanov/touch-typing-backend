import { Request, Response, NextFunction } from "express"

const errorHandler = (err, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode ? res.statusCode : 500

  console.log(err.message)

  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

export default errorHandler
