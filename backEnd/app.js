const express=require('express')
const app=express();
require('dotenv').config();
require('./helpers/conn')
const morgan=require('morgan')
const bodyParser=require('body-parser')
const userRouter=require('./controller/user.controller')

const PORT=process.env.port||3000

app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use('/api/v1/users',userRouter)

app.listen(PORT,()=>
{
    console.log(`server is connected to : ${PORT}`);
})
