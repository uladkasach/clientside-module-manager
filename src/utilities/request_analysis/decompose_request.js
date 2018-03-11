var basic_loaders = require("./../content_loading/basic.js");
var normalize_path = require("./normalize_path.js");
/*
    extract request details
        - utilizes path_analis to extract normalized request path and anaylsis
        - is it an npm module reference? if so then we need to generate the path to the main file
        - what filetype should we load?
*/
var decomposer = {
    promise_to_decompose_module_request : async function(request){
        var package_json = await basic_loaders.promise_to_retreive_json(request)

        /*
            extract path for file
        */
        var base_path = request.substring(0, request.lastIndexOf("/")) + "/"; // get dir from filepath
        var main = (package_json.main)? package_json.main : "index.js"; // if main not defined, its index.js
        var path = base_path + main; // generate path based on the "main" data in the package json

        /*
            determine if package requires sync require
        */
        var package_options = package_json["clientside-require"];
        var injection_type_async_not_in_package_options = (typeof package_options == "undefined" || typeof package_options.require_mode == "undefined" || package_options.require_mode !== "async");
        var injection_type_async_not_in_package_json =  (typeof package_json == "undefined" || package_json.require_mode !== "async");
        var injection_require_type = // define require mode for module; overwrites user selected and percolated injection_require_type passed as an argument to this function
            (injection_type_async_not_in_package_json && injection_type_async_not_in_package_options)? "sync" : "async"; // either user injection_require_type="async", or we assume its "sync";

        /*
            return the data
        */
        return {extension:"js", path:path, injection_require_type:injection_require_type}; // promise all data to be generated
    },
    promise_to_decompose_valid_file_request : function(request, extension, injection_require_type){
        var path = request; // since its not defining a module, the request has path information
        return {extension:extension, path:path, injection_require_type:injection_require_type};
    },

    /*
        parse a js file to extract all dependencies
            - dependencies are defined as module_or_path content found inside of a require() statment in the js file
            - PURPOSE: to enable preloading of modules for sync require injection
    */
    find_dependencies_in_js_file : async function(path){
        var content = await basic_loaders.promise_to_get_content_from_file(path)
        /*
            extract all require requests from js file manually
                - use a regex to match between require(["'] ... ["'])
        */
        //console.log("conducting regex to extract requires from content...");
        var regex = /(?:require\(\s*["'])(.*?)(?:["']\s*\))/g // plug into https://regex101.com/ for description; most important is (.*?) and g flag
        var matches = [];
        while (m = regex.exec(content)){ matches.push(m[1]) };
        return matches
    }

}
var decompose_request = async function(request, modules_root, relative_path_root, injection_require_type){
    var [request, analysis] = normalize_path(request, modules_root, relative_path_root);

    /*
        retreive based on request anaylsis
    */
    if(analysis.is_a_module){ // if not a path and no file extension, assume its a node_module.
        var details = await decomposer.promise_to_decompose_module_request(request);
    } else if(analysis.is_a_path && analysis.exists_valid_extension){ // if its an acceptable extension and not defining a module
        var details = await decomposer.promise_to_decompose_valid_file_request(request, analysis.extension, injection_require_type);
    } else {
        throw new Error("request is not a module and is not a path with a valid extension. it can not be fulfilled.");
    }

    /*
        retreive dependencies if nessesary
    */
    if(details.injection_require_type == "sync" && details.extension == "js"){
        var path_dependencies = await decomposer.find_dependencies_in_js_file(details.path); // get paths this main file is dependent on (recursivly)
    } else {
        var path_dependencies = [];
    }

    /*
        return details in standard format
    */
    var finalized_details = {
        type : details.extension,
        path : details.path,
        injection_require_type : details.injection_require_type, // tells the loader what kind of require function to inject for js files
        dependencies : path_dependencies,
    }
    return finalized_details;
}

module.exports = decompose_request;
