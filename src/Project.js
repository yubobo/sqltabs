var React = require('react');
var Actions = require('./Actions');
var TabsStore = require('./TabsStore');
var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');
var path = require('path');

var Project = React.createClass({

    getInitialState: function(){
        return {
            projects: TabsStore.getProjects(),
            current_path: null,
        };
    },

    update: function(){
        this.setState({projects: TabsStore.getProjects()}); 
    },

    addProjectHandler: function(){
        var self = this;

        dialog.showOpenDialog({ properties: ['openDirectory']}, 
            function(dirs){
                if (typeof(dirs) != 'undefined' && dirs.length == 1){
                    var dirname = dirs[0];
                    var alias = path.basename(dirname);
                    TabsStore.addProject(dirname, alias);
                    self.update();
                }
            }
        );
    },

    toolbar: function(){
        return <div className="project-toolbar"> 
            <a href="#" onClick={this.addProjectHandler}> <span className="glyphicon glyphicon-plus-sign"/> </a>
        </div>
    },

    removeProjectHandler: function(idx){
        TabsStore.removeProject(idx);
        this.update();
    },


    loadProjectHandler: function(idx){
        var path = TabsStore.projects[idx].path;
        this.setState({current_path: path});
    },

    loadPath: function(path){
        this.setState({current_path: path});
    },

    renderPath: function(){
        var self = this;
        if (this.state.current_path == null){
            return null;
        } else {

            var ret_dirs = [];
            var ret_files = []
            var ret_parent = [
                <div className="project-folder" key={"project-file-..-"+this.props.eventKey} onClick={function(){
                    var prev = path.join(self.state.current_path, '..');
                    self.loadPath(prev);
                }}>..</div>
            ];
            var files = fs.readdirSync(this.state.current_path);

            files.forEach(function(file_name, idx){
                var file_path = path.join(self.state.current_path, file_name);
                var isdir = fs.lstatSync(file_path).isDirectory();
                var key = "project-file-"+self.props.eventKey+"-"+file_path;

                if (isdir){
                    var item = <div className="project-folder" key={key} onClick={
                        function(){
                            self.loadPath(file_path);
                        }}>
                        <span className="project-folder-icon glyphicon glyphicon-folder-close"/> {file_name}
                    </div>;
                    ret_dirs.push(item);
                } else {
                    var item = <div className="project-file" key={key} onClick={
                        function(){
                            Actions.openFile(file_path);
                        } 
                    }
                    > {file_name} </div>
                    ret_files.push(item);
                }

            });

            var list = ret_parent.concat(ret_dirs.concat(ret_files));
            return <div className="project-files-list"> <span className="project-current-path">{this.state.current_path}</span>
            {list}
            </div>
        }
    },

    render: function(){
        var self = this;

        var projects = this.state.projects.map(function(item, idx){
            return <div key={"project_"+self.props.eventKey+"_"+idx}> 
                <div className="project-button" onClick={function(){self.loadProjectHandler(idx)}}> {item.alias} </div>
                <div className="project-button-remove" onClick={function(){self.removeProjectHandler(idx)}}> <span className="glyphicon glyphicon-remove-sign"/></div>
            </div>;
        });

        var files = this.renderPath();

        return <div className="project-div">
            <div className="project-list">
                {projects}
                {this.toolbar()}
                <hr/>
            </div>
            {files}
        </div>
    },

});

module.exports = Project;