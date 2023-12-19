const multer=require('multer')
const path=require('path')

const storage=multer.diskStorage({
    destination:(req,file, cb)=>
    {
        return (null, "./uploads")
    },
    filename:(req,file, cb)=>
    {
        return cb(null, `krishna_file:${Date.now()}_${file.originalname}`)
    }
})

const upload=multer({
   storage:storage,
   fileFilter:(req,file,cb)=>
   {
    if(file.mimetype=='image/png'||
        file.mimetype=='image/jpg' ||
        file.mimetype=='image/jpeg')
        {
            return cb(null, true)
        }
        else
        {
           returncb(null,false)   
        }
   } ,
   limits:{
    fieldSize:1024*1024*2
   }
   
})
module.exports=upload