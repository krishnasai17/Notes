import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Dropzone extends Component {
    constructor() {
        super();

        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);

        this.state = {
            isDragActive: false
        };
    }

    onDragLeave(e) {
        this.setState({
            isDragActive: false
        });
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        this.setState({
            isDragActive: true
        });
    }

    onDrop(e) {
        e.preventDefault();

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        this.setState({
            isDragActive: false
        });
        if (this.props.onDrop) {
            this.props.onDrop(files[0]);
        }
        //this._createPreview(e.target.files[0]);
    }

    onClick(e) {
        this.fileInput.click();
    }

    render() {

        var className = 'dropzone';
        if (this.state.isDragActive) {
            className += ' dropzoneactive';
        };

        var style = {
            width: this.props.size || 100,
            height: this.props.size || 100,
            borderStyle: this.state.isDragActive ? 'solid' : 'dashed'
        };

        return (
            <div className={className} onClick={this.onClick} onDragLeave={this.onDragLeave}  onDragOver={this.onDragOver} onDrop={this.onDrop } style={this.props.style}>
                <input style={{ display: 'none' }} type='file' ref={(fileInput) => { this.fileInput = fileInput; }} onChange={this.onDrop } />
                {this.props.children}
            </div>
        );
    }
}

Dropzone.propTypes = {
    onDrop: PropTypes.func.isRequired,
    size: PropTypes.number,
    style: PropTypes.object
};

export default Dropzone;