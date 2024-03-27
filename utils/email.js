const nodemailer=require('nodemailer');

const sendEmail=async(option)=>{
    //create a transporter
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    //define email options
    const emailOptions={
        from:'Cineflex support<support@cineflex.com>',
        to:option.email,
        subject:option.subject,
        text:option.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports=sendEmail;