import gameLogic from '../../services/gameLogic.js'

let Game = {
    render: async () => {
        return `
         <canvas id='canvas'></canvas>
         <canvas id="canvasBackground"></canvas>
         <canvas id="bullets"></canvas>
         <canvas id="canvasSnow"></canvas>
        `;
    }
    ,
    after_render: async () => {
        gameLogic.playGame();
    }
}

export default Game;