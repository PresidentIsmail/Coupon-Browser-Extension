
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOysl-8DUOnsonyG10NqccHz7Fe52EdRs",
  authDomain: "milk-with-honey.firebaseapp.com",
  databaseURL: "https://milk-with-honey-default-rtdb.firebaseio.com",
  projectId: "milk-with-honey",
  storageBucket: "milk-with-honey.appspot.com",
  messagingSenderId: "906168079626",
  appId: "1:906168079626:web:db346fff6cf56c2e4596f3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// console.log(firebase);

chrome.runtime.onMessage.addListener((msg, sender, response) => {

  if (msg.command == "fetch") {
    var domain = msg.data.domain;
    var encode_domain = btoa(domain);

    firebase.database().ref('/domain/' + encode_domain).once('value').then(function (snapshot) {
      response({ type: "result", status: "success", data: snapshot.val(), request: msg })
    });
  }

  // submit coupon data
  if (msg.command == "post") {

    var domain = msg.data.domain;
    var encode_domain = btoa(domain);
    var code = msg.data.code;
    var description = msg.data.desc;

    try {

      var newPost = firebase.database().ref('/domain/' + encode_domain).push().set({
        code: code,
        description: description
      });

      var postId = newPost.key;
      response({ type: "result", status: "success", data: postId, request: msg });

    } catch (e) {
      console.log('error: ' + e);
      response({ type: "result", status: "error", data: e, request: msg });
    }
  }

  return true;

});