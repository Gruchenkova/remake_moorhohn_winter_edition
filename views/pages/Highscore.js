import firebaseMod from '../../services/firebase.js';

let Highscore = {
    render: async () => {
        let view =  /*html*/`
        <div id ='result'>    
            <table id='tb'>
                <tr>
                    <th>#</th>
                    <th>N A M E</th>
                    <th>P O I N T S</th>
                </tr>
            </table>
            <a id="return" class='btn-class' href="/#/">Menu</a>
        </div>
        `
        return view
    },
    after_render: async () => {
        let startAudio = new Howl({
            src: ['./audio/savescore.mp3'],
            volume: 0.1,
            html5: true,
            loop: true,
        })
        startAudio.play();
        addEventListener('hashchange', function(){
            startAudio.stop()
        })
        let callback = (result) => {
            for (let i = 0; i < result.length; i++) {
                let table = document.getElementById('tb')
                let tr = document.createElement('tr');
                table.append(tr);
                let tdIndex = document.createElement('td')
                tr.append(tdIndex);
                tdIndex.innerHTML = i + 1;
                let td = document.createElement('td')
                tr.append(td);
                td.innerHTML = result[i].username;
                let tdPoints = document.createElement('td')
                tr.append(tdPoints);
                tdPoints.innerHTML = result[i].points;
            }
        }
        firebaseMod.getResult(callback);
       
    }
}

export default Highscore;

