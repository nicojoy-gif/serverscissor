const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  userId:{
    type: String,
    required:true
   },  
  firstName: String,
    lastName: String,
    companyName: String,
    email: String,
    phoneNumber: String,
    jobTitle: String,
    companySize: String,
    primaryUseCase: String,
    country: String,
  },
  {timestamps:true}
  );
  
  const Profile = mongoose.model('Profile', ProfileSchema);
  
module.exports = Profile;