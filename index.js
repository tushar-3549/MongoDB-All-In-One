const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create a university course schema

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title must required"], // must required 
        minlength: [3, "minimum length should be 3"],
        // lowercase: true, 
        trim: true,
        // enum: {
        //     values: ["C++ Basic", "Java Basic"],
        //     message: "{VALUE} is not valid",
        // },
    },
    credit: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    outcome: String,
    phone: {
        type: String,
        required: [true, "phone number is required!"],
        validate: {
            validator: function (v) {
                return /\d{3}-\d{3}-\d{4}/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
        },
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});
// create a university course model
const Course = mongoose.model("Courses", CourseSchema);

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/test");
        console.log("Database is connected");
    }
    catch (err) {
        console.log("Database is not connected");
        console.log(err);
        process.exit(1);
    }
}

const PORT = 8888;
app.get("/", (req, res) => {
    res.send("Welcome to our site");
})

// CRUD = Create Read Update Delete

// Create 

app.post("/course", async (req, res) => {
    try {
        const newCourse = new Course({
            title: req.body.title,
            credit: req.body.credit,
            outcome: req.body.outcome,
            phone: req.body.phone,
        })
        const CourseData = await newCourse.save();
        res.status(201).send(CourseData);
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
})


/* app.post("/course", async(req,res)=>{
    try{
        
        const CourseData =await Course.insertMany([
            {
                title: "Basic C++",
                credit: 2,
                outcome: "basic C++ learn and practice",
            },
            {
                title: "Basic Java",
                credit: 2,
                outcome: "basic java learn and practice",
            },
            {
                title: "Basic javaScript",
                credit: 4,
                outcome: "basic javascript learn and practice",
            },
        ]);
        res.status(201).send(CourseData);
    }
    catch(err){
        res.status(500).send({message: err.message});
    }
})
 */

// Read
app.get("/course", async (req, res) => {

    try {
        const Courses = await Course.find();
        // const Courses = await Course.find().limit(2);
        if (Courses) {
            res.status(200).send(Courses);
        }
        else {
            res.status(404).send({
                message: "Course Not Found!"
            })
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

    /* try {
        const credit = req.query.credit;
        let courses;

        if (credit) {
            courses = await Course.find({ credit: credit }).sort({price: 1});
        } else {
            courses = await Course.find();
        }

        if (courses.length > 0) {
            res.status(200).send("Successful");
        } else {
            res.status(404).send("No matching courses found");
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    } */

})

app.get("/course/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // const courses = await Course.find({_id: id}); // return array
        const courses = await Course.findOne({ _id: id }).select({ title: 1, _id: 0 }); //  object return 
        res.send(courses);
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
})

//delete 
app.delete("/course/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.deleteOne({ _id: id });
        if (course) {
            res.status(200).send({
                message: "deleted successfully",
                data: course,
            })
        }
        else {
            res.status(404).send({
                message: "course not found",
            })
        }
    }
    catch (err) {
        res.status(500).send("Something Error! " + err);
    }
})

// update
app.put("/course/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // const updateCredit = await Course.updateOne(
        const updateCredit = await Course.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    credit: 4,
                },
            },
            { new: true },
        )
        if (updateCredit) {
            res.status(200).send({
                message: "Updated credit successfully",
                data: updateCredit,
            })
        }
        else {
            res.status(404).send({
                message: "course not found",
            })
        }

    }
    catch (err) {
        res.status(500).send("Something Error! " + err);
    }
})

app.listen(PORT, async () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
    await connectDB();
})