

    describe("Check line", function(){
        it("checks that a line is valid and does not intersect other lines", function(){
            var line1 = {x1: 0, y1: 0, x2: 100, y2: 100};
            var line2 = {x1: 50, y1: 50, x2: 150, y2: 150};
            var drawnLines = [line1];
            expect(checkValidLine(drawnLines)).toBe(true);
        });
    });