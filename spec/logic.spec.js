

    describe("Check line", function(){
        it("checks that a line is valid and does not intersect other lines", function(){
            var line1 = {x1: 0, y1: 0, x2: 100, y2: 100};
            var line2 = {x1: 50, y1: 50, x2: 150, y2: 150};
            var drawnLines = [line1];
            drawnLines.push(line2);
            expect(checkValidLine(drawnLines)).toBe(true);
        });
        it("checks that a line is not valid and intersects a line", function(){
            var line1 = {x1: 50, y1: 0, x2: 50, y2: 150};
            var line2 = {x1: 0, y1: 75, x2: 150, y2: 75};
            var drawnLines = [line1];
            drawnLines.push(line2);
            expect(checkValidLine(drawnLines)).toBe(false);
        });
    });