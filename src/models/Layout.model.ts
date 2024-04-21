import mongoose, { Document, Schema } from "mongoose"

interface Key {
  code: string;
  value: string[] | string;
  type: "Symbol" | "Digit" | "Modifier" | "Letter";
}


export interface LayoutInterface extends Document {
  keyboard: Key[]
  language: "Eng" | "Geo"
  title: string
  public: boolean
  official: boolean
  creator: mongoose.Types.ObjectId | null
}

const LayoutSchema: Schema<LayoutInterface> = new Schema<LayoutInterface>({
  keyboard: {
    type: [{
        code: {type: String, required: true},
        value: {type: [String] || String, required:  true},
        type: {type: String, required: true , enum : ["Symbol", "Digit", "Modifier", "Letter" ]}
      }],
    required: true
  },
  language: {
    type: String,
    required: false,
    enum: ["Eng", "Geo"],
    default: "Eng"
  },
  title: {
    type: String,
    required: true,
  },
  public: {
    type: Boolean,
    required: false,
    default: false
  },
  official: {
    type: Boolean,
    required: false,
    default: false,
  },
  creator: {
    type: Schema.Types.ObjectId || null,
    ref: "User",
    default: null
  }
})

export default mongoose.model<LayoutInterface>("Layout", LayoutSchema)
