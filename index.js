
//ajkj6K96u2BdZpzt

const { MongoClient } =require("mongodb");
const express=require('express');
const cors=require('cors');
const ObjectId=require('mongodb').ObjectId;
const app=express();
const port=5000;


app.use(cors());
app.use(express.json());

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb+srv://mdsabbirhosenhstu:ajkj6K96u2BdZpzt@cluster0.puqatxy.mongodb.net/?retryWrites=true&w=majority";

// Create a new client and connect to MongoDB
const client = new MongoClient(uri);


  

async function run() {
  try {
      await client.connect();
      const db = client.db('attendance');
    const coursesCollection = db.collection('courses');
    const classesCollection = db.collection('classes');
    const studentsCollection = db.collection('students');

    //post
    app.post('/addCourse', async (req, res) => {
      try {
        const { courseName } = req.body;
        const result = await coursesCollection.insertOne({ name: courseName, classes: [] });
        res.json({ message: `Course ${courseName} added with ID: ${result.insertedId}` });
      } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/addClass/:courseId', async (req, res) => {
      try {
        const courseId = req.params.courseId;
        const { className } = req.body;
        const classResult = await classesCollection.insertOne({ name: className, students: [] });
        await coursesCollection.updateOne({ _id:new ObjectId(courseId) }, { $push: { classes: classResult.insertedId } });
        res.json({ message: `Class ${className} added to course with ID: ${courseId}` });
      } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/addStudent/:classId', async (req, res) => {
      try {
        const classId = req.params.classId;
        const { text } = req.body;
          const findStudent=await studentsCollection.findOne({ student_ID: text })
          if(!findStudent){
            const studentResult = await studentsCollection.insertOne({ student_ID: text });
            await classesCollection.updateOne({ _id:new ObjectId(classId) }, { $push: { students: studentResult.insertedId } });
            res.send({ message: `Student  added to class with ID: ${classId}` });
            console.log(req.body)
          }
          else{
            res.send({message:`${findStudent.student_ID} is already added.`})
          }
        
      } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    //get

    app.get('/getCourses/:courseId',async(req,res)=>{
      const courseId=req.params.courseId;
      const query={_id:new ObjectId(courseId)};
      const course = await coursesCollection.findOne(query);
      res.send(course);
    })
    app.get('/getClasses/:classId',async(req,res)=>{
      
      const classId=req.params.classId;
      const query={_id:new ObjectId(classId)};
      const classes = await classesCollection.findOne(query);
      res.send(classes);
    })
    app.get('/getStudents/:studentId',async(req,res)=>{
      
      const studentId=req.params.studentId;
      const query={_id:new ObjectId(studentId)};
      const students = await studentsCollection.findOne(query);
      res.send(students);
    })

    app.get('/getClasses', async (req, res) => {
      try {
        const classes = await classesCollection.find().toArray();
        res.json({ classes });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/getCourses', async (req, res) => {
      try {
        const courses = await coursesCollection.find().toArray();
        res.json({ courses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/getStudents', async (req, res) => {
      try {
        const students = await studentsCollection.find().toArray();
        res.json({ students });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
  } finally {
     // Close the MongoDB client connection
    // await client.close();
  }
}
// Run the function and handle any errors
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('connected');
});

app.listen(port,()=>{
    console.log('running server on port',port);
});