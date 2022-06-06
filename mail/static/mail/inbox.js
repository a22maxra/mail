document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  let test = document.querySelectorAll('mail');
  // By default, load the inbox
  load_mailbox('inbox');

  var list = [];
  document.querySelector('#compose-form').onsubmit = send_mail;
  document.querySelectorAll('.mail').forEach(button => { 
    console.log("hey");
    button.onclick = function() {
      console.log(this.dataset.id);
      console.log("hey");
    };
  });

  console.log(Array.from(document.getElementsByClassName('mail')))
  console.log(document.querySelectorAll('.mail'));
  console.log(document.getElementsByClassName('mail'));
  console.log(document.querySelector('#emails-view').children);

  document.querySelector('#load').addEventListener('click', () => {
    console.log("yes");
    document.querySelectorAll('.mail').forEach(button => { 
      console.log("hey");
      button.onclick = function() {
        console.log(this.dataset.id);
        console.log("hey");
      };
    });
  });
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  load(mailbox);
}

function send_mail(){
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  console.log(recipients + subject + body)
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');
  return false;
}

function load(mailbox) {
  if (mailbox === 'inbox') {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      // <div class="d-flex border p-2">
      emails.slice().reverse().forEach(mail => {
        const element =  document.createElement("button");
        element.classList.add("d-flex", "w-100", "p-2", "border", "read", "mail");
        element.setAttribute('data-id', mail.id)
        document.querySelector('#emails-view').append(element);
        const sender = document.createElement("div");
        const subject = document.createElement("div");
        const timestamp = document.createElement("div");
        sender.classList.add('font-weight-bold');
        subject.classList.add('pl-2');
        timestamp.classList.add('ml-auto');
        sender.innerHTML = mail.sender;
        subject.innerHTML = mail.subject;
        timestamp.innerHTML = mail.timestamp;
        element.append(sender, subject, timestamp);
        console.log(element)
      });
    });
  };
  console.log("mail")
  console.log(document.querySelectorAll('#emails-view > button'));
}
