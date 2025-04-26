import joi from "joi"


const validatePost = (postData)=>{
    const schema = joi.object({
        content: joi.string().min(3).max(5000).required(),
        mediaIds: joi.array(),
        draftId:joi.string().required()
    })

    return schema.validate(postData);
}

export {validatePost}