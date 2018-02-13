/*
https://github.com/mscdex/ssh2/issues/502

npm install ssh2


https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ssh2-sftp-client


*/

import { Component, OnInit} from '@angular/core';

import * as ssh2Client from 'ssh2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'app works!';
  

  connSettings = {
    host: '******',
    port: 6784,
    username: 'pi',
    password: '*******'
  }

  ngOnInit(){
    let conn = new ssh2Client.Client();
    conn.on('ready', function() {
    console.log('Client :: ready');
    conn.sftp(function(err, sftp) {
      if (err) throw err;
      sftp.readdir('/media/hdd', function(err, list) {
        if (err) throw err;
        console.dir(list);
        conn.end();
      });
    });
  }).connect(this.connSettings);
  }
}

