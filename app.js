const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const favicon = require("serve-favicon");
const path=require("path")

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.use(favicon(path.join(__dirname,'public','favicon.ico')));
mongoose.connect("mongodb+srv://tester:test123@cluster0.pbdhmjh.mongodb.net/task-listDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Function to get the day name from the day index
function getDayName(dayIndex) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex];
}

const toDoListSchema = new mongoose.Schema({
  task: { type: String },
});
const listSchema = new mongoose.Schema({
  name: String,
  task: { type: String },
  items: [toDoListSchema],
});
const List = mongoose.model("List", listSchema);

const tasks = new mongoose.model("tasks", toDoListSchema);

const taskstobe_done1 = new tasks({
  task: "Welcome to your to-do list of the day",
});

const taskstobe_done2 = new tasks({
  task: "Hit the + button to create a new task or add a new item",
});

const taskstobe_done3 = new tasks({
  task: "<-- Hit this button to delete an item",
});

const defaultItems = [taskstobe_done1, taskstobe_done2, taskstobe_done3];

// GET request for the root URL ("/")
app.get("/", async function (req, res) {
  try {
    const foundresult = await tasks.find({});
    console.log(foundresult);

    var date = new Date();
    var currentDay = getDayName(date.getDay()); // Use the getDayName function to get the current day name

    var options = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };

    var formattedDate = datbbbbbbbbbbe.toLocaleDateString("en-us", options);

    if (foundresult.length === 0) {
      await tasks.insertMany(defaultItems);
      console.log("Inserted default tasks");
      res.redirect("/");
      return;
    }

    // Pass the correct variable name (currentDay) to the template
    res.render("list", { currentlero: currentDay, newitems: foundresult });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// GET request for custom list names
app.get("/:CustomListName", function (req, res) {
  const CustomListName = _.capitalize(req.params.CustomListName);

  List.findOne({ name: CustomListName })
    .exec()
    .then((foundList) => {
      if (!foundList) {
        // Create a new list and save it
        const list = new List({
          name: CustomListName,
          items: defaultItems,
        });

        list.save()
          .then(() => {
            res.render("list", { currentlero: CustomListName, newitems: defaultItems });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send("Internal Server Error");
          });
      } else {
        // Access an already existing list
        res.render("list", { currentlero: foundList.name, newitems: foundList.items });
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/" + CustomListName);
    });
});

// POST request for adding new tasks
app.post("/", async function (req, res) {
  let item = req.body.newtask;
  let listmoja = req.body.list;
  let leo = new Date();
  let LeoHii = leo.getDay();

  //used to collect new items which the user enters
  const newTask = new tasks({ task: item });

  await newTask.save();

  const siku = new Date().getDate();

  if (LeoHii === siku) {
    res.redirect("/");
  } else {
    List.findOne({ name: listmoja })
      .exec()
      .then((foundList) => {
        if (!foundList) {
          // Create a new list if not found
          const newList = new List({
            name: listmoja,
            items: [newTask], // Start with the newly added task as a default item
          });
          return newList.save();
        } else {
          foundList.items.push(newTask);
          return foundList.save();
        }
      })
      .then(() => {
        res.redirect("/" + listmoja);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  }
});

// POST request for deleting tasks
app.post("/delete", async function (req, res) {
  const checkedItem = req.body.check;
  const ListName = req.body.listname;

  if (
    ListName === "Sunday" || "Monday" ||"Tuesday" ||"Wednesday" ||"Thursday" ||"Friday" ||"Saturday"
  ) {
    // Deleting an item
    tasks.findByIdAndRemove(checkedItem)
      .then((result) => {
        console.log(result, "has been deleted successfully");
        res.redirect("/");
      })
      .catch((err) => {
        console.log("your error is ", err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    List.findOneAndUpdate(
      { name: ListName },
      { $pull: { items: { _id: checkedItem } } }
    )
      .then((foundList) => {
        console.log(res.redirect("/" + ListName));
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  }
});


app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
