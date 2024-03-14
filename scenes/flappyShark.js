// Definindo a cena principal do jogo usando a biblioteca Phaser
class FlappyShark extends Phaser.Scene {

    // Construtor da cena
    constructor() {
        super({
            key: 'FlappyShark',
            // Configurações específicas da cena podem ser adicionadas aqui
             physics: {
               arcade: {
                debug: true,
                //gravity: { y: 500 }
               } 
            }
        });
    }

    // Inicialização de variáveis e configurações da cena
    init() {
        // 1) FUNDO
        // A imagem do fundo possui 1200 de largura e 400 de altura.
        // Mas somente uma janela de 400x400 é exibida por vez.
        // Essa janela vai se alterando, simulando o movimento do fundo
        // As variáveis possibilitam o controle da janela em exibição
        this.bg = {
            x_start: 0,
            x: 0,
            y: 50,
            x_end: -800,
            obj: null
        };

        // 2) COLUNA
        //Os parâmetros speed e space podem ser alterados para deixar o jogo mais fácil ou mais difícil

        this.cols = {
            speed: 60, // velocidade com que as colunas passam, quanto maior, mais rápidamente passam
            space: 200, // vão entre as colunas por onde o dragão tem que passar, quanto maior mais espaço entre as colunas
            x: 500, // posição inicial à direita do canvas, quanto maior, mais tempo demora para a coluna aparecer
            min_x: 400,
            max_x: 800,
            y: -500, // posição inicial acima do canvas, quanto maior, mais para cima aparece a coluna inferior
            min_y: -500,
            max_y: -200,
            height: 600, // altura da imagem da coluna,
            width: 50,
            col1_obj: null,
            col2_obj: null
        };

        // 3) JOGADOR
        this.player = {
            width: 128,
            height: 128,
            obj: null
        };

        // 4) CONTROLES DA RODADA
        this.gameControls = {
            over: false,
            current_col_scored: false,
            score: 0,
            restart: null
        };

    }

    // Pré-carregamento de recursos
    preload() {
        this.load.image('mar', 'assets/img/fundomar.jpg');
        this.load.spritesheet('tubarao', 'assets/img/SpritesheetShark.png', { frameWidth: this.player.width, frameHeight: this.player.height });
        this.load.image('alga1', 'assets/img/alga2.png');
        this.load.image('alga2', 'assets/img/alga.png');
        this.load.image('gameOver', 'assets/img/gameOver.png');
        this.load.image('restart', 'assets/img/restart.png');
        this.load.image('peixeComum', 'assets/img/peixe_comum.png');
        this.load.image('peixeDourado', 'assets/img/peixe_dourado.png');
    }

    // Criação de elementos e configurações iniciais da cena
    create() {
  
        // 1) Adiciona a imagem de fundo
        this.bg.obj = this.add.image(this.bg.x, this.bg.y, 'mar').setOrigin(0, 0);

        // 2) Adiciona imagens das colunas
        this.cols.col1_obj = this.add.image(this.cols.x, this.cols.y, 'alga1').setOrigin(0, 0);
        this.cols.col2_obj = this.add.image(this.cols.x, this.cols.y + this.cols.height + this.cols.space, 'alga2').setOrigin(0, 0);
        this.physics.add.existing(this.cols.col1_obj);
        this.physics.add.existing(this.cols.col2_obj);
        this.cols.col1_obj.body.allowGravity = false;
        this.cols.col2_obj.body.allowGravity = false;
        this.cols.col1_obj.body.setVelocityX(-this.cols.speed);
        this.cols.col2_obj.body.setVelocityX(-this.cols.speed);

        // 3) Adiciona jogador e suas propriedades físicas
        this.player.obj = this.physics.add.sprite(170, 130, 'tubarao').setScale(.8);
        this.player.obj.body.setSize(50, 80, true);
        this.player.obj.setCollideWorldBounds(true);

        // 4) Adiciona animação da imagem do jogador
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('tubarao', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Adiciona peixes dourado e normal
        var pos_peixe_dourado_x = Phaser.Math.RND.between(100, 350);
        var pos_peixe_dourado_y = Phaser.Math.RND.between(100, 500);
        var peixe_dourado = this.physics.add.staticImage(pos_peixe_dourado_x, pos_peixe_dourado_y, 'peixeDourado');

        var pos_peixe_comum_x = Phaser.Math.RND.between(100, 350);
        var pos_peixe_comum_y = Phaser.Math.RND.between(100, 500);
        var peixe_comum = this.physics.add.staticImage(pos_peixe_comum_x, pos_peixe_comum_y, 'peixeComum');


        this.physics.add.collider(peixe_dourado, this.player.obj, function(){
            // o placar ficava contando qdo o tubarao estava passando no lugar do 1o peixe, tive que usar o disableBody para fazer funcionar
            peixe_dourado.disableBody(true,true) 
            var y = Phaser.Math.RND.between(100, 500);
            peixe_dourado.enableBody(true, 310, y, true, true)
            this.gameControls.score += 5
            // inclui um timeout de meio segundo para o peixe aparece 
            setTimeout(function () {
                peixe_dourado.setVisible(true);
                placar5 = 0
            }, 500);
            console.log(placar5 + ' - ' + this.gamecontrols.score)
        })

        this.physics.add.collider(peixe_comum, this.player.obj, function(){
            peixe_comum.disableBody(true,true)
            var y = Phaser.Math.RND.between(100, 500);
            peixe_comum.enableBody(true, 310, y, true, true)
            placar1 =1
            setTimeout(function () {
                peixe_comum.setVisible(true);
                placar1 = 0
            }, 500);
        })

        // 5) Adiciona a animação do movimento do jogador
        this.player.obj.anims.play('fly');

        // 6) Adiciona os cursores que movimentarão o jogador
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;

        // 7) Adiciona os monitores de pegar peixe
        this.physics.add.overlap(this.player.obj, this.cols.col1_obj, this.hitCol, null, this);
        this.physics.add.overlap(this.player.obj, this.cols.col2_obj, this.hitCol, null, this);

       
        // 8) Mostra o placar
        this.scoreText = this.add.text(15, 15, this.game.name + ': 0', { fontSize: '20px', fill: '#000' });
        this.add.text(50,50,this.placar,{ fontSize: '20px', fill: '#000' })
        this.highScoreText = this.add.text(0, 15, 'high score: ' + this.game.highScore, { fontSize: '20px', fill: '#000', align: 'right' });
        this.highScoreText.x = this.game.config.width - this.highScoreText.width - 15;
        this.gameControls.restartBt = this.add.image(this.game.config.width / 2 - 50, this.game.config.height / 4 * 3,
            'restart').setScale(.2).setOrigin(0, 0).setInteractive().setVisible(false);

        // 9) Adiciona evento de clique no botão de "reiniciar"
        this.gameControls.restartBt.on('pointerdown', function () {
            // Controla se o jogo acabou e se a tecla que o botão de reiniciar foi acionado
            if (this.gameControls.over) {
                this.gameControls.over = false;
                this.gameControls.score = 0;
                this.cols.x = -this.cols.width - 1;
                this.scene.restart();
            }
        }, this);
    }

    // Atualização lógica do jogo a cada frame
    update() {
        // Controla se o jogo acabou e paraliza a cena (interrompendo a execução de "update")
        if (this.gameControls.over) {
            return;
        }

        // Atualiza a posição da imagem de fundo
        this.bg.x--;
        if (this.bg.x < this.bg.x_end) {
            this.bg.x = this.bg.x_start;
        }
        this.bg.obj.x = this.bg.x;

        // Atualiza posição das colunas
        this.cols.x = this.cols.col1_obj.x;
        if (this.cols.x < -this.cols.width) {
            this.cols.x = Phaser.Math.FloatBetween(this.cols.min_x, this.cols.max_x); // sorteia o intervalo antes das próximas colunas
            this.cols.col1_obj.x = this.cols.x;
            this.cols.col2_obj.x = this.cols.x;

            this.cols.y = Phaser.Math.FloatBetween(this.cols.min_y, this.cols.max_y); // sorteia a posição vertical
            this.cols.col1_obj.y = this.cols.y;
            this.cols.col2_obj.y = this.cols.y + this.cols.height + this.cols.space;

            this.gameControls.current_col_scored = false;
        }

        // Inclui controle de movimentação do dragão
        if (this.cursors.left.isDown)
            this.player.obj.setX(this.player.obj.x - 5);
        else if (this.cursors.right.isDown)
            this.player.obj.setX(this.player.obj.x + 5);
        else if (this.cursors.up.isDown || this.cursors.space.isDown || this.pointer.isDown)
            this.player.obj.setY(this.player.obj.y - this.game.config.physics.arcade.gravity.y);
        else if (this.cursors.down.isDown)
            this.player.obj.setY(this.player.obj.y + this.game.config.physics.arcade.gravity.y);

        if(this.placar5 = 1){
            this.gameControls.score += 5
            console.log(this.placar5)
        }
        if(this.placar1 = 1){
            this.gameControls.score += 1
        }

        // Verifica se o jogador passou pelas colunas
        if (!this.gameControls.current_col_scored) {
            if (this.player.obj.x - this.player.width / 2 > this.cols.x + this.cols.width) {
                this.gameControls.score++;
                this.gameControls.current_col_scored = true;
                this.scoreText.setText(this.game.name + ': ' + this.gameControls.score);
            }
        }
    }

    // Função chamada quando o jogador colide com uma coluna
    hitCol(player_obj, col_obj) {
        this.physics.pause();
        this.player.obj.anims.stop('fly');
        this.player.obj.setTint(0xff0000);
        this.gameControls.over = true;
        this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameOver').setScale(.5);
        this.gameControls.restartBt.visible = true;
        if (this.gameControls.score > this.game.highScore) {
            this.game.highScore = this.gameControls.score;
            this.highScoreText.setText('high score: ' + this.game.highScore);
        }
    }
    
}