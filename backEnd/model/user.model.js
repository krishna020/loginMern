const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true, // kuch bhi do lowercase me hi store karega.
    validate: {
      validator: function (value) {
        // Custom validation function to check if the email ends with "@gmail.com"
        return /\b[A-Za-z0-9._%+-]+@gmail\.com\b/.test(value);
      },
      message: props => `${props.value} is not a valid Gmail address!`
    }
  },
  password: {
    type: String,
  },
  confirm_password: {
    type: String,
  },
  profile_pics: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  mobile_number:{
    type:Number,
    required:true,
    unique:true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
},
longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
}

}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const hashPassword = await bcrypt.hash(this.password, 10)
      this.password = hashPassword
    }
    catch (err) {
      return 'error in pre save'
    }
  }
  next()
})

const User = mongoose.model('User', userSchema)
module.exports = User