// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAIPDB3f1XvkSXTuqYY8OEEya1o9yb-uqg",
    authDomain: "myproject-moorhohn-remake.firebaseapp.com",
    databaseURL: "https://myproject-moorhohn-remake-default-rtdb.firebaseio.com",
    projectId: "myproject-moorhohn-remake",
    storageBucket: "myproject-moorhohn-remake.appspot.com",
    messagingSenderId: "945058541316",
    appId: "1:945058541316:web:daaefe9f74256136382a51",
    measurementId: "G-3VFYB46MKR"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//   firebase.analytics();

// Get a reference to the database service
const database = firebase.database();


let firebaseMod = {
    writeResult: (name, result) => {
        firebase.database().ref('result').push({
            username: name,
            points: result,
        });
    },

    getResult: (callback) => {
        
        firebase.database().ref("/result").orderByChild('points').limitToLast(5).on('value', snap => {
            let scoreTable = [];
            snap.forEach(child => {
                scoreTable.push(child.val());
            });
            callback(scoreTable.reverse());
        })

    }
}

export default firebaseMod;