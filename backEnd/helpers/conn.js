const mongoose=require('mongoose')
require('dotenv').config()
const URL=process.env.MONGODB_url
mongoose.connect(URL)
.then(()=>
{
    console.log(`connected to ${URL}`)
})
.catch((err)=>
{
    console.log(err.message);
})