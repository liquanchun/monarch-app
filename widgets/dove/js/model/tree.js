/* 
 * Package: tree.js
 * 
 * Namespace: monarch.model
 * 
 */

// Module and namespace checking.
if (typeof monarch == 'undefined') { var monarch = {};}
if (typeof monarch.model == 'undefined') { monarch.model = {};}

/*
 * Constructor: tree
 * 
 * Parameters:
 *  data - the JSON object as a string in the following format:
 * {
     "root": {
         "id": "HP:0000118",
         "label": "Phenotypic Abnormality",
         "children": [
             {
                 "id": "HP:0000707",
                 "label": "Nervous System",
                 "counts": [
                     {
                         "value": 21290,
                         "name": "Human"
                     },
                     {
                         "value": 38136,
                         "name": "Mouse"
                     }
                 ],
                 "children": [
                     {
                         "label": "Nervous System Morphology",
                         "id": "HP:0012639",
                         "counts": [
                             {
                                 "value": 7431,
                                 "name": "Human"
                             },
                             {
                                 "value": 24948,
                                 "name": "Mouse"
                             }
                         ]
                     }
                 ]
             }
         ]
     }
 * }
 * Returns:
 *  tree object
 */
monarch.model.tree = function(data){
    var self = this;
    if (data){
        self._data = data;
        self.checkSiblings(data.root.children);
    }
};

//Return entire tree data 
monarch.model.tree.prototype.getTree = function(){
    return this._data;
};

//Set entire tree data 
monarch.model.tree.prototype.setTree = function(data){
    self._data = data;
};

monarch.model.tree.prototype.setRootID = function(root){
    this._data.root.id = root;
};

//Return entire tree data 
monarch.model.tree.prototype.getRootID = function(){
    return this._data.root.id;
};

monarch.model.tree.prototype.getRootLabel = function(){
    return this._data.root.label;
};

monarch.model.tree.prototype.hasRoot = function(){
    return (this._data.root && this.getRootID());
};

monarch.model.tree.prototype.getFirstSiblings = function(){
    return this._data.root.children;
};


monarch.model.tree.prototype.addCountsToNode = function(node_id, counts, parents) {
    var self = this;
    
    //Check that parents lead to something
    var siblings = self.getDescendants(parents);
    var index = siblings.map(function(i){return i.id;}).indexOf(node_id);
    
    if (index == -1){
        throw new Error ("Error in locating node given "
                         + parents + " and ID: " + node_id);
    } else {
        siblings[index]['counts'] = counts;
    }
    
    return self;
};

/*
 * Function: checkDescendants
 * 
 * Check if we have descendants given a list of parents
 * 
 * Parameters:
 *  parents - list of IDs leading to descendant
 * 
 * Returns:
 *  boolean 
 */
monarch.model.tree.prototype.checkDescendants = function(parents){
    var self = this;
    var areThereDescendants = true;
    var descendants =[];
    
    if (typeof parents != 'undefined' && parents.length > 0){
        
        if (parents[0] != self.getRootID()){
            throw new Error ("first id in parent list is not root");
        }
        descendants = self.getFirstSiblings();
        for (var i = 0; i < (parents.length-1); i++) {
            //skip root
            if (i == 0){
                continue;
            } else {
                var branch = self._jumpOneLevel(parents[i], descendants);
                descendants = branch.children;
            }
        }
        
    } else {
        areThereDescendants =  self.hasRoot();
    }
    console.log(descendants);
    if (descendants.length > 0 && 'id' in descendants[0] && typeof descendants[0].id != 'undefined'){
        areThereDescendants = true;
    } else {
        areThereDescendants = false;
    }

    return areThereDescendants;
};
    

/*
 * Function: getDescendants
 * 
 * Return a descendant given a list of IDs leading to the descendant
 * 
 * Parameters:
 *  parents - list of IDs leading to descendant
 * 
 * Returns:
 *  object containing descendant data
 */
monarch.model.tree.prototype.getDescendants = function(parents){
    var self = this;
    
    // Start at root
    var descendants = [];
    
    if (typeof parents != 'undefined' && parents.length > 0){
        
        if (parents[0] != self.getRootID()){
            throw new Error ("first id in parent list is not root");
        }

        parents.forEach( function(r,i){
            //skip root
            if (i == 0){
              descendants = self.getFirstSiblings();
            } else {
                var branch = self._jumpOneLevel(r, descendants);
                descendants = branch.children;
            }
        });
    } 
    
    return descendants;
};

/*
 * Function: _jumpOneLevel
 * 
 * Return a descendant given a list of IDs leading to the descendant
 * 
 * Parameters:
 *  id - id to move into on branch
 *  branch - branch of a tree
 * 
 * Returns:
 *  object containing branch of data where id is the root
 */
monarch.model.tree.prototype._jumpOneLevel = function(id, branch){
    branch = branch.filter(function(i){return i.id == id;});
    if (branch.length > 1){
        throw new Error ("Cannot disambiguate id: " + id);
    } else if (branch.length == 0){
        throw new Error ("Error in locating descendant given "
                + parents + " failed at ID: " + id);
    }
    return branch[0];
}

//TODO improve checking
// Just checks top level of tree
monarch.model.tree.prototype.checkSiblings = function(siblings){
    if (typeof siblings === 'undefined'){
        throw new Error ("tree object is undefined");
    }
  
    siblings.forEach(function (r){
        //Check ID
        if (r.id == null){
            throw new Error ("ID is not defined in self.data object");
        }
        if (r.label == null){
            r.label = r.id;
        }
        if (r.counts == null){
            //throw new Error ("No statistics for "+r.id+" in self.data object");
        } else {
            r.counts.forEach(function (i){
                if (i.value == null){
                    r.value = 0;
                }
            });
        }
    });
    return self;
};