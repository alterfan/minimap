class Drawer {
    constructor(context) {
        this.context = context;
    }
    get maxRow() {
        const h = cache.miniMapHeight;
        const maxlines = Math.ceil(h / 3);
        return maxlines;
    }
    get lineHeight() {
        return 3;
    }
    get SyntaxColor() {
        return cache.get("syntaxColorsTokens");
    }
    clear(startY, endY) {
        
        

        startY = startY ? startY * 3 : 0
        endY = endY ? endY * 3 : this.maxRow;

        this.context.save();
        this.context.clearRect(0, startY, cache.miniMapWidth, this.maxRow * 3);
        this.context.restore();
    }
    draw(from, to, e) {
        var curent, y, end;
        if (e)
            curent = e.type == "scroll" ? 0 : from;
        this.clear(0, to - from);
        
        y = 1;
        curent = from ? from : 0;
        end = to ? to : cache.lineCount;
        for (curent; curent < end; curent++) {
            const tokens = this.lineTokens[curent];
            if (tokens == undefined) return
            this.drawLine(y, tokens);
            y = y + 3
        }
    }
    get lineTokens() {
        return cache.lineTokens;
    }
    drawLine(y, lineTokens, event) {
        var tokenArr, token, i, n;
        this.posX = 1;
        this.posY = y;
        for (i = 0; i < lineTokens.length; i++) {
            token = lineTokens[i];
            if (token.type == null) {
                tokenArr = token.string.split(/(\s+)/).filter(x => x);
                for (n = 0; n < tokenArr.length; n++) {
                    token = {};
                    token.string = tokenArr[n];
                    token.type = "#text";
                    if (/[\s]/.test(token.string)) token.type = "#space";
                    this.drawToken(token);
                }
            } else {
                this.drawToken(token);
            }
        }
    }
    drawToken(token) {
        let charHeight = 2
        let charWidth = 2
        var width, color = this.SyntaxColor[token.type];
        width = charWidth * token.string.length;
        this.drawRect(color, this.posX, this.posY, width, charHeight);
        this.posX = this.posX + width;
    }
    drawRect(color, x, y, width, height) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height)
    }
    //drawText(color, text, x, y) {
    //    this.context.fillStyle = color;
    //    this.context.fillText(text, x, y);
    //}
};