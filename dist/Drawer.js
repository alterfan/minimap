class Drawer {
    constructor(context) {
        this.context = context;
    }
    get maxRow() {
        const h = Buffer.get("miniMapHeight");
        const maxlines = Math.ceil(h / 3);
        return maxlines;
    }
    get lineHeight() {
        return 3;
    }
    get SyntaxColor() {
        return Buffer.get("syntaxColorsTokens");
    }
    clear(startY, endY) {
        var y = startY * 3 || 0,
            h = endY * 3 || Buffer.get("editorHeight");
        this.context.save();
        this.context.clearRect(0, y, Buffer.get("miniMapWidth"), Buffer.get("editorHeight"));
        this.context.restore();
    }
    draw(firstRow, lastRow) {
        this.firstRow = firstRow;
        this.lastRow = lastRow || Buffer.get("linesCount");
        this.clear();
        this.context.save();
        for (let lineIndex = firstRow || 0; lineIndex < this.lastRow; lineIndex++) {
            let line = this.linesTokens[lineIndex];
            if (line == undefined) return
            this.drawLine(lineIndex, line)
        }
        this.context.restore();
    }
    get linesTokens() {
        return Buffer.get("linesTokens");
    }
    drawLine(line, lineTokens) {
        var tokenArr, token, i, n;
        this.posX = 1;
        this.posY = 1 + this.lineHeight * (line - this.firstRow);
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
    drawText(color, text, x, y) {
        this.context.fillStyle = color;
        this.context.fillText(text, x, y);
    }
};