'use strict';

/*********** MessageBox ****************/

function getModal(id) {
  return bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
}

function infoMessageBox(message, title) {
  document.getElementById('info-body').innerHTML = message;
  document.getElementById('info-title').innerHTML = title;
  getModal('info-popup').show();
}

function errorMessageBox(message) {
  var msg =
    __T['msg.operation_failed'] + ' ' + message + '. ' +
    __T['msg.see_error_log'];
  infoMessageBox(msg, __T['popup.error']);
}

function messageBox(body, title, ok_text, close_text, callback) {
  var modalBody = document.getElementById('modal-body');
  if (typeof body === 'string') {
    modalBody.innerHTML = body;
  } else {
    modalBody.innerHTML = '';
    modalBody.appendChild(body);
  }
  document.getElementById('modal-title').innerHTML = title;
  if (ok_text) document.getElementById('modal-button').innerHTML = ok_text;
  if (close_text) document.getElementById('modal-close-button').innerHTML = close_text;

  var btn = document.getElementById('modal-button');
  var newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', function() {
    getModal('popup').hide();
    if (callback) callback();
  });

  getModal('popup').show();
}


/*********** crontab actions ****************/

var schedule = '';
var job_command = '';

function deleteJob(_id) {
  messageBox('<p>' + __T['confirm.delete_job'] + '</p>', __T['confirm.delete'], null, null, function() {
    $.post(routes.remove, {_id: _id}, function() {
      location.reload();
    });
  });
}

function stopJob(_id) {
  messageBox('<p>' + __T['confirm.stop_job'] + '</p>', __T['confirm.stop'], null, null, function() {
    $.post(routes.stop, {_id: _id}, function() {
      location.reload();
    });
  });
}

function startJob(_id) {
  messageBox('<p>' + __T['confirm.start_job'] + '</p>', __T['confirm.start'], null, null, function() {
    $.post(routes.start, {_id: _id}, function() {
      location.reload();
    });
  });
}

function runJob(_id) {
  messageBox('<p>' + __T['confirm.run_job'] + '</p>', __T['confirm.run'], null, null, function() {
    $.post(routes.run, {_id: _id}, function() {
      location.reload();
    });
  });
}

function setCrontab() {
  messageBox('<p>' + __T['confirm.set_crontab'] + '</p>', __T['confirm.crontab_setup'], null, null, function() {
    $.get(routes.crontab, { 'env_vars': $('#env_vars').val() }, function() {
      infoMessageBox(__T['msg.set_crontab_ok'], __T['popup.information']);
      location.reload();
    }).fail(function(response) {
      errorMessageBox(response.statusText);
    });
  });
}

function getCrontab() {
  messageBox(
    '<p>' + __T['confirm.get_crontab'] + '</p>',
    __T['confirm.crontab_retrieval'], null, null, function() {
      $.get(routes.import_crontab, { 'env_vars': $('#env_vars').val() }, function() {
        infoMessageBox(__T['msg.get_crontab_ok'], __T['popup.information']);
        location.reload();
      });
    });
}

function editJob(_id) {
  var job = null;
  crontabs.forEach(function(crontab) {
    if (crontab._id == _id) job = crontab;
  });

  if (job) {
    getModal('job').show();
    $('#job-name').val(job.name);
    $('#job-command').val(job.command);
    if (job.schedule.indexOf('@') !== 0) {
      var components = job.schedule.split(' ');
      $('#job-minute').val(components[0]);
      $('#job-hour').val(components[1]);
      $('#job-day').val(components[2]);
      $('#job-month').val(components[3]);
      $('#job-week').val(components[4]);
    }
    if (job.mailing) {
      $('#job-mailing').attr('data-json', JSON.stringify(job.mailing));
    }
    schedule = job.schedule;
    job_command = job.command;
    if (job.logging && job.logging != 'false')
      $('#job-logging').prop('checked', true);
    job_string();
  }

  var saveBtn = document.getElementById('job-save');
  var newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
  newSaveBtn.addEventListener('click', function() {
    if (!schedule) schedule = '* * * * *';
    var name = $('#job-name').val();
    var mailing = JSON.parse($('#job-mailing').attr('data-json'));
    var logging = $('#job-logging').prop('checked');
    $.post(routes.save, {name: name, command: collapsedCommand(), schedule: schedule, _id: _id, logging: logging, mailing: mailing}, function() {
      location.reload();
    });
    getModal('job').hide();
  });
}

function newJob() {
  schedule = '';
  job_command = '';
  $('#job-minute').val('*');
  $('#job-hour').val('*');
  $('#job-day').val('*');
  $('#job-month').val('*');
  $('#job-week').val('*');

  getModal('job').show();
  $('#job-name').val('');
  $('#job-command').val('');
  $('#job-mailing').attr('data-json', '{}');
  $('#job-logging').prop('checked', false);
  job_string();

  var saveBtn = document.getElementById('job-save');
  var newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
  newSaveBtn.addEventListener('click', function() {
    if (!schedule) schedule = '* * * * *';
    var name = $('#job-name').val();
    var mailing = JSON.parse($('#job-mailing').attr('data-json'));
    var logging = $('#job-logging').prop('checked');
    $.post(routes.save, {name: name, command: collapsedCommand(), schedule: schedule, _id: -1, logging: logging, mailing: mailing}, function() {
      location.reload();
    });
    getModal('job').hide();
  });
}

function duplicateJob(_id) {
  var job = null;
  crontabs.forEach(function(crontab) {
    if (crontab._id == _id) job = crontab;
  });
  if (!job) return;

  var name = job.name ? job.name + ' ' + __T['job.copy_suffix'] : '';
  var logging = (job.logging && job.logging != 'false') ? job.logging : 'false';
  var mailing = job.mailing || {};

  $.post(routes.save, {
    name: name,
    command: job.command,
    schedule: job.schedule,
    _id: -1,
    logging: logging,
    mailing: mailing
  }, function() {
    location.reload();
  });
}

function doBackup() {
  messageBox('<p>' + __T['confirm.backup'] + '</p>', __T['confirm.backup_title'], null, null, function() {
    $.get(routes.backup, {}, function() {
      location.reload();
    });
  });
}

function delete_backup(db_name) {
  messageBox('<p>' + __T['confirm.delete_backup'] + '</p>', __T['confirm.delete'], null, null, function() {
    $.get(routes.delete_backup, {db: db_name}, function() {
      location = routes.root;
    });
  });
}

function restore_backup(db_name) {
  messageBox('<p>' + __T['confirm.restore_backup'] + '</p>', __T['confirm.restore'], null, null, function() {
    $.get(routes.restore_backup, {db: db_name}, function() {
      location = routes.root;
    });
  });
}

function import_db() {
  messageBox(
    '<p>' + __T['confirm.import_crontab'] + '</p>',
    __T['confirm.import_title'], null, null, function() {
      $('#import_file').click();
    });
}

function setMailConfig(a) {
  var data = JSON.parse(a.getAttribute('data-json'));
  var container = document.createElement('div');

  container.innerHTML += '<p>' + __T['mail.description'] + '</p>';

  var transporterLabel = document.createElement('label');
  transporterLabel.className = 'form-label';
  transporterLabel.innerHTML = __T['mail.transporter'];
  var transporterInput = document.createElement('input');
  transporterInput.type = 'text';
  transporterInput.id = 'transporterInput';
  transporterInput.setAttribute('placeholder', config.transporterStr);
  transporterInput.className = 'form-control';
  if (data.transporterStr) {
    transporterInput.setAttribute('value', data.transporterStr);
  }
  container.appendChild(transporterLabel);
  container.appendChild(transporterInput);

  container.innerHTML += '<br/>';

  var mailOptionsLabel = document.createElement('label');
  mailOptionsLabel.className = 'form-label';
  mailOptionsLabel.innerHTML = __T['mail.mail_config'];
  var mailOptionsInput = document.createElement('textarea');
  mailOptionsInput.setAttribute('placeholder', JSON.stringify(config.mailOptions, null, 2));
  mailOptionsInput.className = 'form-control';
  mailOptionsInput.id = 'mailOptionsInput';
  mailOptionsInput.setAttribute('rows', '10');
  if (data.mailOptions)
    mailOptionsInput.innerHTML = JSON.stringify(data.mailOptions, null, 2);
  container.appendChild(mailOptionsLabel);
  container.appendChild(mailOptionsInput);

  container.innerHTML += '<br/>';

  var button = document.createElement('a');
  button.className = 'btn btn-primary btn-sm';
  button.innerHTML = __T['btn.use_defaults'];
  button.onclick = function() {
    document.getElementById('transporterInput').value = config.transporterStr;
    document.getElementById('mailOptionsInput').innerHTML = JSON.stringify(config.mailOptions, null, 2);
  };
  container.appendChild(button);

  var buttonClear = document.createElement('a');
  buttonClear.className = 'btn btn-secondary btn-sm';
  buttonClear.innerHTML = __T['btn.clear'];
  buttonClear.onclick = function() {
    document.getElementById('transporterInput').value = '';
    document.getElementById('mailOptionsInput').innerHTML = '';
  };
  container.appendChild(buttonClear);

  messageBox(container, __T['mail.title'], null, null, function() {
    var transporterStr = document.getElementById('transporterInput').value;
    var mailOptions;
    try {
      mailOptions = JSON.parse(document.getElementById('mailOptionsInput').value);
    } catch (err) { /* ignore parse error */ }

    if (transporterStr && mailOptions) {
      a.setAttribute('data-json', JSON.stringify({transporterStr: transporterStr, mailOptions: mailOptions}));
    } else {
      a.setAttribute('data-json', JSON.stringify({}));
    }
  });
}

function setHookConfig(a) {
  messageBox('<p>' + __T['hooks.coming_soon'] + '</p>', __T['hooks.title'], null, null, null);
}

function collapsedCommand() {
  return job_command.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean).join('; ');
}

function job_string() {
  var cmd = collapsedCommand();
  $('#job-string').val(schedule + ' ' + cmd);
  return schedule + ' ' + cmd;
}

function set_schedule() {
  schedule = $('#job-minute').val() + ' ' + $('#job-hour').val() + ' ' + $('#job-day').val() + ' ' + $('#job-month').val() + ' ' + $('#job-week').val();
  job_string();
}

function previewCrontab() {
  $.get(routes.preview_crontab, function(data) {
    document.getElementById('preview-crontab-content').textContent = data || __T['preview.empty'];
    getModal('preview-crontab-modal').show();
  });
}

function copyCrontab() {
  var text = document.getElementById('preview-crontab-content').textContent;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.querySelector('#preview-crontab-modal .btn-outline-secondary');
    btn.innerHTML = '<i class="bi bi-check2"></i> ' + __T['btn.copied'];
    setTimeout(function() {
      btn.innerHTML = '<i class="bi bi-clipboard"></i> ' + __T['btn.copy'];
    }, 2000);
  });
}
