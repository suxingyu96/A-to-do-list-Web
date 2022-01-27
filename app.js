const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var _ = require('lodash');
// const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');


app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// connect to Database
mongoose.connect('mongodb+srv://Xingyu:sxy960307@cluster0.ovwys.mongodb.net/todolistDB',{useNewUrlParser:true});


const itemSchema=mongoose.Schema({
  name:String
});


const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"Welcome to your todolist!"
});

const item2=new Item({
  name:"Hit + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema= {
  name:String,
  items:[itemSchema]
}

const List=mongoose.model("List",listSchema);




//  can't assign new array but can add or modify data
// const workItems = [];

app.get("/", function(req, res) {

      Item.find({}, function(err, foundItems) {
        if (err) {
          console.log(err);
        } else {
          if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("success!");
              }
            });
            res.redirect('/');
          } else {

            res.render("list", {
              listTitle: "Today",
              newItem: foundItems
            });
          }
        }
      });



  // const day=date.getDate();
  //   res.render("list", {
  //   listTitle: "Today",
  //   newItem: items
  // });
});

app.get('/:customerListName', function(req, res) {
  const customerName = _.capitalize(req.params.customerListName);

  List.findOne({
    name: customerName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customerName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customerName);

      }
      else {
        console.log("exits");
        res.render("list", {
          listTitle: foundList.name,
          newItem: foundList.items
        });
      }
    }


  });
});





app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name:itemName
  });

  if (listName === "Today")
  {
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+listName);
    });
  }




});
app.post('/delete',function(req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedId, function(err) {
      if (err)
      {
        console.log(err);
      }
      else
      {
        console.log("The item is deleted!");
        res.redirect('/');
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    })
  }

});


let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}



app.listen(port, function() {
  console.log("Server started");
});
