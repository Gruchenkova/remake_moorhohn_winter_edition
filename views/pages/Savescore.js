import {point} from '../../services/gameLogic.js';
import firebaseMod from '../../services/firebase.js';

let Savescore = {
    render: async () => {
        let view =  /*html*/`
           <div id='saveResult'>
           <p>Введите ваше имя:</p>
            <input id='name'></input>
            <p>Ваш результат:${point} очков</p>
            <ul id='saveUl'>
                <li id='saveResBtn' class='btn-class'><a href="./#/highscore">Сохранить</a></li>
                <li id=#cancelBtn class='btn-class'><a href="./#/">Отмена</a></li>
            </ul>
           </div>
        `
        return view
    }
    , after_render: async () => {
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
        let btnSave = document.getElementById('saveResBtn');
        btnSave.addEventListener('click', saveResult)
        function saveResult(){
            let inputName = document.getElementById('name');
            firebaseMod.writeResult(inputName.value, point )
        }
    }

}

export default Savescore;
