

    describe("Check line", function(){
        it("checks that a line is valid and does not intersect other lines", function(){
            var line1 = {x1: 0, y1: 0, x2: 100, y2: 100};
            var line2 = {x1: 50, y1: 50, x2: 150, y2: 150};
            var drawnLines = [line1];
            drawnLines.push(line2);
            //should not intersect
            expect(checkValidLine(drawnLines)).toBe(true);
        });
        it("checks that a line is not valid and intersects a line", function(){
            var line1 = {x1: 50, y1: 0, x2: 50, y2: 150};
            var line2 = {x1: 0, y1: 75, x2: 150, y2: 75};
            var drawnLines = [line1];
            drawnLines.push(line2);
            //should intersect
            expect(checkValidLine(drawnLines)).toBe(false);
        });
    });
    
    describe("Select end point", function(){
        it("chooses an end point in quadrant 1", function(){
           var line1 = {x1: 50, y1: 150, x2: 0, y2: 0};
           selectEndPoint(line1);
           //y2 should be 150
           expect(line1.y2).toEqual(150);
        });
        it("chooses an end point in quadrant 2", function(){
           var line1 = {x1: 550, y1: 150, x2: 0, y2: 0};
           selectEndPoint(line1);
           //x2 should be 550
           expect(line1.x2).toEqual(550);
        });
        it("chooses an end point in quadrant 3", function(){
           var line1 = {x1: 50, y1: 550, x2: 0, y2: 0};
           selectEndPoint(line1);
           //y2 should be 550
           expect(line1.y2).toEqual(550);
        });
        it("chooses an end point in quadrant 4", function(){
           var line1 = {x1: 750, y1: 550, x2: 0, y2: 0};
           selectEndPoint(line1);
           //y2 should be 550
           expect(line1.y2).toEqual(550);
        });
    });