module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
        "indent": [ "error", 4 ],
        "linebreak-style": [ "error", "unix" ],
        "quotes": [ "error", "single" ],
        "semi": [ "error", "always" ],
        "no-constant-condition": ["error", { "checkLoops": false }],
        "no-console": "off",
        "no-unused-vars": "off",
        "no-useless-escape": "off",
        "no-trailing-spaces": "error"
    },
    "globals": {
        "window": true,
        "document": true
    }
};