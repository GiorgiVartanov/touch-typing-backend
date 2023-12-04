import mongoose, { Document, Schema } from "mongoose"

export interface WordState {
    word: string,
    count: number,
}

export interface WordInterface extends WordState, Document {}

const wordSchema : Schema<WordInterface> = new Schema<WordInterface>({
    word: {
        type: String,
        required: true,
    }, 
    count: {
        type: Number,
        required: true,
    }
})

export default mongoose.model<WordInterface>("Word", wordSchema)

/*
    import Word, {WordState} from "../model/Word.model"
    fs = require('fs')
    fs.readFile("../mongoDB-Words.txt",'utf-8', (err, data) => {
      if (err) throw err;
      //setTimeout(()=>{},3000);
      // Converting Raw Buffer to text
      // data using tostring function.
      let dataArr : WordState[] = []
      let Data = new String(data)
      console.log(typeof data)
      console.log(typeof Data)
      //console.log
      Data.split("\n").forEach(line => {
        const Line = new String(line)
        let pair = Line.split(" ")
        dataArr.push({word: pair[0], count: Number(new String(pair[1]).split("\r")[0])})
      })
      //console.log(dataArr)
      dataArr.slice(100000,300471).forEach(async el=>{
        console.log(el)
        await Word.create(el)
      })
    })
    
*/