const Joi = require('joi');

const schemas = {
  infrastructure: Joi.object({
    labName: Joi.string().required(),
    equipment: Joi.string().required(),
    capacity: Joi.number().min(0),
    location: Joi.string().allow(''),
    status: Joi.string().valid('Functional', 'Maintenance', 'Under Repair')
  }),
  courseAssignment: Joi.object({
    facultyId: Joi.string().required(),
    facultyName: Joi.string().required(),
    courseName: Joi.string().required(),
    semester: Joi.string().required(),
    section: Joi.string().required(),
    students: Joi.array().items(
      Joi.object({
        studentId: Joi.string().required(),
        studentName: Joi.string().required(),
        attendance: Joi.number().min(0).max(100),
        grade: Joi.string().allow('')
      })
    )
  }),
  student: Joi.object({
    name: Joi.string().required(),
    attendance: Joi.number().min(0).max(100).required(),
    credits: Joi.number().min(0).required(),
    results: Joi.string().allow(''),
    department: Joi.string().required(),
    year: Joi.string().required()
  }),
  user: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'HOD', 'Faculty', 'Student', 'Auditor').required(),
    department: Joi.string().allow('')
  })
};

module.exports = schemas;
