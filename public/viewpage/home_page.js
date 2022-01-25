import * as Elements from './element.js'
import { routePath } from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import * as protectedMessage from './protected_message.js'
import { Thread } from '../model/thread.js';
import * as constants from '../model/constants.js'
import *  as FirestoreController from '../controller/firestore_controller.js'
import * as Util from './util.js'

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', () => {
        history.pushState(null, null, routePath.HOME);
        home_page();
    });

    Elements.formCreateThread.addEventListener('submit', addNewThread);
}

async function addNewThread(e) {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;
    const keywords = e.target.keywords.value;
    const uid = currentUser.uid;
    const email = currentUser.email;
    const timestamp = Date.now();
    const keywordsArray = keywords.toLowerCase().match(/\s+/g);

    const thread = new Thread({
        title, uid, content, email, timestamp, keywordsArray
    });

    try {
        const docId = await FirestoreController.addThread(thread);
        thread.set_docId(docId);
        Util.info('Success', 'A new thread has been added', Elements.modalCreateThread)
    }
    catch (e) {
        if (constants.DEV) console.log(e);
        Util.info('Failed', JSON.stringify(e), Elements.modalCreateThread);
    }
}

export async function home_page() {
    if (!currentUser) {
        Elements.root.innerHTML = protectedMessage.html;
        return;
    }
    //read all threads
    let threadList;
    try {
        threadList = await FirestoreController.getThreadList();

    } catch (e) {
        if (constants.DEV) console.log(e);
        Util.info('Error to get thread list', JSON.stringify(e));
        return;
    }
    buildHomeScreen(threadList);
}

function buildHomeScreen(threadList) {
    let html = '';
    html += `
    <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modal-create-thread">  
    + New Thread</button>
    `
    html += `
    <table class="table table-striped">
<thead>
    <tr>
      <th scope="col">Action</th>
      <th scope="col">Title</th>
      <th scope="col">keyword</th>
      <th scope="col">posted</th>
      <th scope="col">content</th>
      <th scope="col">posted</th>
    </tr>
  </thead>
  <tbody>
    `;
    threadList.forEach(thread => {

        html += `

        <tr>

        ${buildThreadView(thread)}

        </tr>

        `;

    });

    html += '</tbody></table>';



    if (threadList.length == 0) {

        html += '<h4>NO Threads Found</h4>'

    }



    Elements.root.innerHTML = html;

}



function buildThreadView(thread) {

    return `

    <td>View</td>

    <td>${thread.title}</td>

    <td>${!thread.keywordsArray || !Array.isArray(thread.keywordsArray) ? '' : thread.keywordsArray.join(' ')}</td>

    <td>${thread.email}</td>

    <td>${thread.content}</td>

    <td>${new Date(thread.timestamp).toString()}</td>




    `;

}