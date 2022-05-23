const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ObjectID } = require("mongodb");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");
const req = require("express/lib/request");
require("dotenv").config();

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqsch.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const uri =
//   "mongodb+srv://dbuser1:gias1234@cluster0.9xmah.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const uri = `mongodb+srv://onlineDoctors:J8tkqlZUV77r6eKS@cluster0.jqsch.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const studentsCollection = client
    .db("eLearningManagement")
    .collection("students");
  const usersCollection = client.db("eLearningManagement").collection("users");
  const categoryCollection = client
    .db("eLearningManagement")
    .collection("category");
  const courseCollection = client
    .db("eLearningManagement")
    .collection("course");
  const myCoursesCollection = client
    .db("eLearningManagement")
    .collection("myCourses");
  const videosCollection = client
    .db("eLearningManagement")
    .collection("videos");

  app.post("/addStudent", async (req, res) => {
    // const name = req.body.name;
    // const email = req.body.email;
    // const phone = req.body.phone;
    // const role = "user";
    // const password = req.body.password;
    // const pic = req.files.image;
    // const picData = pic.data;
    // const encodedPic = picData.toString("base64");
    // const imageBuffer = Buffer.from(encodedPic, "base64");
    // const info = {
    //   name,
    //   email,
    //   password,
    //   phone,
    //   role,
    //   image: imageBuffer,
    // };
    // console.log(info);
    console.log(req.body);
    const result = await usersCollection.insertOne(req.body);
    console.log(result);
    res.send(result);
  });

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);
    usersCollection
      .find({ email: req.body.email })
      .toArray((err, documents) => {
        if (documents?.length > 0) {
          // console.log("email is valid");
          usersCollection
            .find({ password: req.body.password })
            .toArray((error, results) => {
              if (results?.length > 0) {
                const userData = {
                  status: true,
                  userInfo: results[0]?.role,
                  userEmail: results[0]?.email,
                };
                if (req?.body?.status == "admin") {
                  if (results[0]?.role == "admin") {
                    console.log(results[0]);
                    res.send(userData);
                  } else {
                    res.send({
                      status: false,
                      message: "you are not admin Please try again ",
                    });
                  }
                } else {
                  res.send(userData);
                  console.log("eita admin naaaaaaa");
                }

                console.log(results[0].role);
              } else {
                res.send(false);
              }
            });
        } else {
          res.send(false);
        }
      });
  });

  app.post("/addCourse", async (req, res) => {
    console.log("hello post");
    console.log(req.body);
    const result = await courseCollection.insertOne(req.body);
    res.send(result);
  });
  app.post("/category", async (req, res) => {
    console.log(req.body);
    const result = await categoryCollection.insertOne(req.body);
    res.send(result);
  });
  app.post("/addVideos", async (req, res) => {
    console.log(req.body);
    const result = await videosCollection.insertOne(req.body);
    res.send(result);
  });

  // all uses

  app.get("/teachers", async (req, res) => {
    const result = await usersCollection.find({ role: "teacher" }).toArray();
    res.send(result);
  });
  app.get("/users", async (req, res) => {
    const result = await usersCollection.find({}).toArray();
    res.send(result);
  });
  app.get("/courseVideos", async (req, res) => {
    const result = await videosCollection.find({}).toArray();
    res.send(result);
  });

  app.get("/bookedCourse", async (req, res) => {
    const result = await myCoursesCollection.find({}).toArray();
    res.send(result);
  });

// get my appointment
  
  




  app.get("/courses", async (req, res) => {
    console.log("hello");
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const query = {};
    const cursor = courseCollection.find(query);
    let courses;
    if (page || size) {
      // 0 --> skip: 0 get: 0-10(10):
      // 1 --> skip: 1*10 get: 11-20(10):
      // 2 --> skip: 2*10 get: 21-30 (10):
      // 3 --> skip: 3*10 get: 21-30 (10):
      courses = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
    } else {
      courses = await cursor.toArray();
    }

    // const result = await courseCollection.find({}).toArray();
    res.send(courses);
  });

  app.get("/courseCount", async (req, res) => {
    const count = await courseCollection.estimatedDocumentCount();
    res.send({ count });
  });
  app.get("/courses/:category", async (req, res) => {
    const category = req.params.category;
    console.log(category);
    const result = await courseCollection.findOne({ category: category });
    res.send(result);
  });

  app.get("/category", async (req, res) => {
    console.log("hello");
    const result = await categoryCollection.find({}).toArray();
    res.send(result);
  });

  app.put("/myBooking/:id", async (req, res) => {
    const courseId = req?.params?.id;
    const email = req?.body?.data.email;
    const paymentInfo = req.body.data.paymentInfo;
    console.log(email);
    if (courseId && email && paymentInfo) {
      const course = await courseCollection.findOne({
        _id: ObjectId(courseId),
      });
      delete course._id;
      course.date = new Date();
      course.email = email;
      course.paymentInfo = paymentInfo;
      course.status = "pending";
      const result = await myCoursesCollection.insertOne(course);
      res.send(result);
      console.log(result);
    }

    // console.log(r)
  });

  app.put("/makeTeacher/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const data = req.body.data;
    const filter = {
      _id: ObjectId(req?.params?.id),
    };
    const updateDoc = {
      $set: { role: "teacher" },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
  });
  app.put("/courseStatus/:id", async (req, res) => {
    const id = req?.params?.id;

    const data = req.body.data;
    console.log(data);

    const filter = {
      _id: ObjectId(id),
    };
    const userFilter = {
      email: data?.email,
    };

    const updateUser = {
      $set: { role: "student" },
    };
    const updateDoc = {
      $set: { status: data.status },
    };
    const result = await myCoursesCollection.updateOne(filter, updateDoc);
    if (result.modifiedCount) {
      const results = await usersCollection.updateOne(userFilter, updateUser);
      res.send(results);
      console.log(results);
    }
  });

  app.delete("/deleteCourse/:id", async (req, res) => {
    console.log(req.params.id);
    const result = await courseCollection.deleteOne({
      _id: ObjectId(req?.params?.id),
    });
    res.send(result);
  });

  app.delete("/deleteUser/:id", async (req, res) => {
    console.log(req.params.id);
    const result = await usersCollection.deleteOne({
      _id: ObjectId(req?.params?.id),
    });
    res.send(result);
  });
  app.delete("/deleteTeacher/:id", async (req, res) => {
    console.log(req.params.id);
    const result = await usersCollection.deleteOne({
      _id: ObjectId(req?.params?.id),
    });
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`E-learning App listening on port ${port}`);
});
