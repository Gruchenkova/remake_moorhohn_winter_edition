import firebaceMod from '../../services/firebase.js';

let Home = {
    render: async () => {
        let view =  /*html*/`
            <div id='menu'>
            <ul id='homeul'>
            <li id='btnGame' class='btn-class'><a href="/#/newgame">New game</a></li>
            <li id='btnHighScore' class='btn-class'><a href="/#/highscore">High score</a></li>
            <ul>
            </div>
        `
        return view
    }
    , after_render: async () => {
        let startAudio = new Howl({
            src: ['./audio/moorhuhnwinter_dat-0000000061.mp3'],
            volume: 0.1,
            html5: true,
            loop: true,
        })
        startAudio.play()
        addEventListener('hashchange', function(){
            startAudio.stop()
        })
    }

}

export default Home;
