var assert = require("assert");
var modules_root = "/test_node_modules";
var relative_path_root = "/test_rel_path_root";

describe('normalize_path', function(){
    it('should initialize', function(){
        require(process.env.src_root + "/utilities/request_analysis/normalize_path.js");
    })
    describe('validation', function(){
        it('should throw an error if the request path is undefined', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path.js");
            var path = undefined;
            try {
                var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);
                throw new Error("path should not have validated")
            } catch (error){
                assert.equal(error.message, "path is undefined", "error message should be expected");
            }
        })
        it('should throw an error if the request path is null', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path.js");
            var path = null;
            try {
                var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);
                throw new Error("path should not have validated")
            } catch (error){
                assert.equal(error.message, "path is null", "error message should be expected");
            }
        })
        it('should throw an error if the request path is whitespace', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path.js");
            var path = "   ";
            try {
                var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);
                throw new Error("path should not have validated")
            } catch (error){
                assert.equal(error.message, "path is empty - all whitespace", "error message should be expected");
            }
        })
    })
    describe("accuracy", function(){
        it('should find absolute path accurately', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path.js");
            var path = "/test/path";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);

            // validate analysis
            assert.equal(analysis.is_a_module, false, "analysis.is_a_module is accurate")
            assert.equal(analysis.is_relative_path, false, "analysis.is_rel_path is accurate")
            assert.equal(analysis.extension, "js", "analysis.extension is accurate")

            // validate path
            assert.equal(norm_path, "http://clientside-require.localhost/test/path.js", "absolute_path is accurate")
        })
        it('should find absolute path accurately - no extension', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path");
            var path = "/test/path";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);

            // validate analysis
            assert.equal(analysis.is_a_module, false, "analysis.is_a_module is accurate")
            assert.equal(analysis.is_relative_path, false, "analysis.is_rel_path is accurate")
            assert.equal(analysis.extension, "js", "analysis.extension is accurate")

            // validate path
            assert.equal(norm_path, "http://clientside-require.localhost/test/path.js", "absolute_path is accurate")
        })
        it('should find relative path accurately - type 1', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path");
            var path = "./test/path.js";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);

            // validate analysis
            assert.equal(analysis.is_a_module, false, "analysis.is_a_module is accurate")
            assert.equal(analysis.is_relative_path, true, "analysis.is_rel_path is accurate")
            assert.equal(analysis.extension, "js", "analysis.extension is accurate")

            // validate path
            assert.equal(norm_path, "http://clientside-require.localhost/test_rel_path_root/test/path.js", "relative_path is accurate")
        })
        it('should find relative path accurately - type 2', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path");
            var path = "../test/path.js";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);

            // validate analysis
            assert.equal(analysis.is_a_module, false, "analysis.is_a_module is accurate")
            assert.equal(analysis.is_relative_path, true, "analysis.is_rel_path is accurate")
            assert.equal(analysis.extension, "js", "analysis.extension is accurate")

            // validate path
            assert.equal(norm_path, "http://clientside-require.localhost/test_rel_path_root/../test/path.js", "relative_path is accurate")
        })
        it('should find module path accurately', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path");
            var path = "test-module";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);

            // validate analysis
            assert.equal(analysis.is_a_module, true, "analysis.is_a_module is accurate")
            assert.equal(analysis.is_relative_path, false, "analysis.is_rel_path is accurate")
            assert.equal(analysis.extension, "json", "analysis.extension is accurate")

            // validate path
            assert.equal(norm_path, "http://clientside-require.localhost/test_node_modules/test-module/package.json", "relative_path is accurate")
        })
        it('should clean path with //+, like browsers do', function(){
            var normalize_path = require(process.env.src_root + "/utilities/request_analysis/normalize_path");
            var path = "https://test/test//test///test////test/test//test.js";
            var [norm_path, analysis] = normalize_path(path, modules_root, relative_path_root);
            console.log(norm_path);
            // validate path
            assert.equal(norm_path, "https://test/test/test/test/test/test/test.js", "cleaned path is accurate")
        })
    })
})
