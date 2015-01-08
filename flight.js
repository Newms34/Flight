var currRot = 0;//current vehicle rotation  
var currThrot = 20;//current throttle. Automatically set to 0 when fuel runs out
var thrustLR=0;//left-right thrust
var thrustUD = 20;//up-down thrust (note that up 'thrust' is just gravity)
var vertPos = 200;//current vertical position
var horPos = 600;//current horizontal pos   ition
var fuel = 50000;//current fuel
var fuelMax = 50000;//maximum fuel. Fuel bar is based on (fuel/fuelMax)*100
var platLeft = 0;//platform left bound
var platRight = 100;//platform right bound
var keyNums = 0;//number of key presses. Used for score
var vsiCurr = 0;//CURRENT vsi needle position. 
var vsiPos=0;//target vsi needle position
var gameEnd=0;//flag to determine game end state. If this is true, the ship is no longer pilotable.
var score = 100000;//starting score.
var vertAccel = 0;//note that for this, we're making 'g' 15. I may increase it later if the ship is rising TOO quickly at medium thrust.
var timeLord;//basically, run
/*TO DO:
 *Make controls easier to understand: Label fuel gauge, and make:
 *IE doesn't turn! why?
 */
function go(){
    timeLord = setInterval(function(){frameShip()},80);
    $('#halp').css({'display':'none'})
}
function instSet() {
    var attRot= currRot * -1;
    var throtPos = Math.floor((-3.14*currThrot)+110)+'px';
    $('#throtLev').css({'top':throtPos});
    $('#attitudeInt').css({ WebkitTransform: 'rotate(' + attRot + 'deg)'});
    $('#attitudeInt').css({ '-moz-transform': 'rotate(' + attRot + 'deg)'});
}

$(document).ready(function placePlat() {
    platLeft = Math.ceil(Math.random()*1425);
    platRight =  platLeft+100;
    var platform = document.getElementById('landingPlat');
    platform.style.left=platLeft+'px';
    document.getElementById('landPlatStick').style.left=parseInt((platRight-platLeft)/2) + 'px';
});
//placePlat();

function Score(){
    //fuel first
    score = Math.floor((fuel/fuelMax)*50000)+50000;
    //now key presses
    score = score - keyNums*10;
}

function frameShip() {
    vertPos -= vertAccel;
    horPos += thrustLR;
    $('#shipContainer').css({'top':vertPos});
    $('#shipContainer').css({'left':horPos});
    if (fuel >0 ){
        fuel -= currThrot*2;
    }
    else {
        vertAccel = -36
        $('#shipExhaust').css({'border-top-width':0});
    }
    vertAccel += .05*Math.floor(thrustUD-15);//note that for this, we're making 'g' 15. I may increase it later if the ship is rising TOO quickly at medium thrust.
    var fuelPerc = Math.floor((fuel/fuelMax)*200);
    $('#fuelBar').css({'width':fuelPerc});
    //$('#report').html('L-R:'+thrustLR+'<br/>U-D:'+thrustUD+'<br/>Vert Acel:'+vertAccel+'<br/>Fuel Remaining:'+fuel);
    $('#report').html('SCORE: '+score);
    vsiSet();
    instSet();
    vsiCurr = vertAccel *4;
    Score();
    checkPos();
    
}

function vsiSet (){
    
    if (vsiPos<vsiCurr){
        vsiPos += .1*(vsiCurr-vsiPos);
    }
    else if (vsiPos>vsiCurr) {
        vsiPos -= .1*(vsiPos-vsiCurr);
    }
    else {
        vsiPos = vsiCurr;
    }
    var vsiIndCol = document.getElementById('VSI');
    if (vsiPos<-20) {
        //crashing!
        vsiIndCol.style.border = '2px outset red';
    }
    else {
        //not crashing!
        vsiIndCol.style.border = '2px outset silver';
    }
    $('#vsiNeedleBase').css({ WebkitTransform: 'rotate(' + vsiPos + 'deg)'});
        // For Mozilla browser: e.g. Firefox
    $('#vsiNeedleBase').css({ '-moz-transform': 'rotate(' + vsiPos + 'deg)'});
}

function checkPos(){
    if ((vertPos > 582)&&(vertPos<650)&& (horPos>platLeft)&& (horPos+75 <platRight)){
        //ship has reached platform
        //check to make sure ship lands gently
        if ((vertAccel > -5)&&(Math.abs(currRot)<5)) {
            end('win');
        }
        else{
            end('crash');
        }
        
    }
    else if (vertPos > 650) {
        end('crash');
    }
    else if (vertPos < -5000) {
        //ship went into orbit
        end('bye');
    }

}
function end(state){
    //function ends: either win, crash, or 'lost contact'
    clearInterval(timeLord);
    gameEnd=1;
    if (state=='crash') {
        //crashed
        $('#shipContainer').css({'background':'#FFC','border-radius':'50%','box-shadow':'0 0 10px 10px #FFC, 0 0 15px 15px #FF0, 0 0 20px 20px #FC0, 0 0 25px 25px #F00, 0 0 30px 30px #C00'});
        score *= .25;
        $('#report').html('SCORE: '+score+'<hr/>You crashed!<br/><input type=button value=\'Play again?\' onclick=\'location.reload()\'/>');
        $('#badEnd').css({'background':'url(crash.png)'});
    }
    else if(state=='win') {
        //won
        $('#report').html('SCORE: '+score+'<hr/>You landed!<br/><input type=button value=\'Play again?\' onclick=\'location.reload()\'/>');
    }
    else {
        //on escape
        $('#shipContainer').css({'background':'#FFC','border-radius':'50%','box-shadow':'0 0 10px 10px #FFC, 0 0 15px 15px #FF0, 0 0 20px 20px #FC0, 0 0 25px 25px #F00, 0 0 30px 30px #C00'});
        score *= .25;
        $('#report').html('SCORE: '+score+'<hr/>You\'ve left orbit!<br/><input type=button value=\'Play again?\' onclick=\'location.reload()\'/>');
        $('#badEnd').css({'box-shadow':'0 0 15px #ccf inset'});
    }
    document.getElementById('shipExhaust').style.borderTop = '0px solid #ccf';
    checkCookie();
    //alert('Final data:\nLeftPlat:'+platLeft+'\nleftShip:'+horPos+'\nVert Accel:'+vertAccel+'\nVert Pos:'+vertPos+'\nSCORE: '+score);

    
}
$(document).on("keydown", function (e) {
    /*keys:
     *87:w
     *65:a
     *83:s
     *68:d
     *37:left
     *38:up
     *39:right
     *40:down
     *(e.which)
    */
    var goodKey = 0;//was the key one of the keys below?
    if (!gameEnd) {
        //game's still running
        keyNums+=1;
        if (e.which==65 || e.which==37) {
            //left
            // For webkit browsers: e.g. Chrome
            currRot -=2;
            $('#shipContainer').css({ WebkitTransform: 'rotate(' + currRot + 'deg)'});
            // For Mozilla browser: e.g. Firefox
            $('#shipContainer').css({ '-moz-transform': 'rotate(' + currRot + 'deg)'});
            goodKey = 1;
            
        }
        else if (e.which==68 || e.which==39) {
            //right
            // For webkit browsers: e.g. Chrome
            currRot +=2;
            $('#shipContainer').css({ WebkitTransform: 'rotate(' + currRot + 'deg)'});
            // For Mozilla browser: e.g. Firefox
            $('#shipContainer').css({ '-moz-transform': 'rotate(' + currRot + 'deg)'});
            goodKey = 1;
        }
        else if ((e.which==87 || e.which==38)&& currThrot<35 && fuel>0) {
            //up (increase throttle)
            currThrot ++;
            $('#shipExhaust').css({'border-top-width':currThrot});
            goodKey = 1;
        }
        else if ((e.which==83 || e.which==40)&& currThrot>1 && fuel>0) {
            //down (reduce throttle)
            currThrot --;
            $('#shipExhaust').css({'border-top-width':currThrot});
            goodKey = 1;
        }
        if (fuel<0) {
            currThrot = 0;
            $('#shipExhaust').css({'border-top-width':currThrot});
            goodKey = 1;
        }
    }
    //now, calculate the percent exhaust left-right and up-down
    thrustLR = Math.floor(Math.sin(currRot*Math.PI/180)*currThrot);
    thrustUD = Math.floor(Math.cos(currRot*Math.PI/180)*currThrot);
    if(goodKey){
        e.preventDefault();
        return false;
    }
});

//game saving stuff!
//check if score exists. If it does, check to see if current score is HIGHER than old score
function getCookie() {
    var name = 'flightCookie=';
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
} 
function checkCookie() {
    var oldScoreCookie = getCookie();
    if (oldScoreCookie != "") {
        //old score DOES exist
        if (parseInt(oldScoreCookie)<score) {
            //new high score!
            setCookie(score);
            document.getElementById('report').innerHTML+='<br/>Your high score: <br/>'+score;
        }
        else{
            //old high score!
            document.getElementById('report').innerHTML+='<br/>Your high score: <br/>'+oldScoreCookie;
        }
    }
    else {
        //no old score!
        setCookie(score);
        document.getElementById('report').innerHTML+='<br/>Your high score: <br/>'+score;
    }
}
function setCookie(currScore){
    var d = new Date();
    d.setTime(d.getTime() + (31536000000));
    var expires = "expires="+d.toUTCString();
    document.cookie='flightCookie='+currScore+'; '+expires;
}
