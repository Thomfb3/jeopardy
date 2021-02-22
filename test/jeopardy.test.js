getCategoryIds();

describe("#getCategoryIds Test", function () {

    it("should return true that the categry array length is <= 50", function () {
        let categoryIdArray = categories.map((cat) => cat.id);
        expect(categoryIdArray.length <= 50).toEqual(true);
    });
    
    it("should return true that every item in array is a number", function () {
        let categoryIdArray = categories.map((cat) => cat.id);
        expect(categoryIdArray.every((num) => Number.isFinite(num))).toEqual(true);
    });

    it("should return true that categories array is not empty", function () {
        expect(categories === []).toEqual(false);
    });

    it("should return true that every category has an id", function () {
        expect(categories.every((cat) => cat.hasOwnProperty("id"))).toEqual(true);
    });

    it("should return true that every category has a title", function () {
        expect(categories.every((cat) => cat.hasOwnProperty("title"))).toEqual(true);
    });

});


describe("#objectFilter test ", function () {

    let goodObj = {
        id: 1234,
        question: "does this work?",
        answer: "yes"
    }

    let badObj1 = {
        id: 1234,
        question: "",
        answer: "yes"
    }

    let badObj2 = {
        id: 1234,
        question: "Hi",
        answer: "="
    }

    let badObj3 = {
        id: 1234,
        question: "[audio]",
        answer: "No"
    }


    it("should return true good object", async function () {
        expect(objectFilter(goodObj)).toEqual(true);
    });

    it("should return false for object with empty string", async function () {
        expect(objectFilter(badObj1)).toEqual(false);
    });

    it("should return false for object with a string of '=' ", async function () {
        expect(objectFilter(badObj2)).toEqual(false);
    });

    it("should return false for object with empty '[audio]'", async function () {
        expect(objectFilter(badObj3)).toEqual(false);
    });

});



