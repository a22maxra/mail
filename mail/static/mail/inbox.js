document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  let test = document.querySelectorAll('mail');
  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = () => {
    send_mail();
    load_mailbox('sent');
  };
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-text').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-text').style.display = 'none';
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
  return false;
}

function load(mailbox) {
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Load all emails
    emails.forEach(mail => {
      const element =  document.createElement("button");
      if (mail.read === true){
        element.classList.add("bg-secondary")
      }
      element.classList.add("d-flex", "w-100", "p-2", "border", "mail");
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
      
      // Go to mail to read when clicking on it
      element.addEventListener('click', () => view_mail(mail.id, mailbox))
    });
  });
}

function view_mail(id, mailbox) {
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-text').style.display = 'block';
  const container = document.querySelector('#email-text');
  container.innerHTML = '';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // From, To, Subject, Timestamp
    values = {
      sender: ["From", email['sender']],
      recipient: ["To", email['recipients']],
      subject: ["Subject", email['subject']],
      timestamp: ["Timestamp", email['timestamp']],
    }
    for (value in values) {
      const element = document.createElement("div");
      const div = document.createElement("div");
      const content = document.createElement("div");
      element.classList.add("d-flex");
      container.append(element);
      div.classList.add("font-weight-bold");
      div.innerHTML = `${values[value][0]}: &nbsp;`;
      content.innerHTML = values[value][1];
      element.append(div, content);
    }
    // Body
    const element = document.createElement("div");
    element.classList.add("d-flex", "border-top");
    element.innerHTML = email['body'];
    container.append(element);

    // Load Reply and Archive buttons if the mailbox or either inbox or archive
    if (mailbox == 'inbox' || mailbox ==='archive') {
      const Reply = document.createElement("button");
      const Archive = document.createElement("button");
      Reply.innerHTML = "Reply";
      Archive.innerHTML= "Archive";
      Reply.classList.add("btn", "btn-primary", "mt-2");
      Archive.classList.add("btn", "btn-primary", "mt-2", "ml-2");
      container.append(Reply, Archive);

      // Change appearance of Archive button if archived
      if (email['archived'] == true){
        Archive.classList.toggle("btn-danger");
        Archive.classList.toggle("btn-primary");
      };

      // Archive email on click
      Archive.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email['archived'],
          })
        });
        load_mailbox('inbox');
      });

      // Reply to email
      Reply.addEventListener('click', () => {
        compose_email();
        console.log(email['subject'].slice(0,3));
        if (email['subject'].slice(0,3) === "Re:") {
          document.querySelector('#compose-subject').value = email['subject'];
          console.log("if");
        }
        else {
          document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
          console.log("else");
        }
        document.querySelector('#compose-recipients').value = email['sender'];
        document.querySelector('#compose-body').value = 
        `On ${email['timestamp']} ${email['sender']} wrote: ${email['body']}`;
      });
    };

    // Mark as read
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true,
      })
    });
  });
}