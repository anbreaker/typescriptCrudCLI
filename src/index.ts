import inquirer from 'inquirer';
import {TaskColletion} from './models/TaskColletion';
import {tasks} from './exampleData';

const colletion = new TaskColletion('anbreaker', tasks);
let showCompleted: boolean = true;

function displayTaskList(): void {
  console.log(
    `${colletion.username}'s Task:       ${
      colletion.getTaskCounts().incomplete
    } task to do:`
  );
  colletion.getTaskItems(showCompleted).forEach((task) => task.printDetails());
}

enum Commands {
  Add = 'Add new Task',
  Complete = 'Complete Task',
  Toggle = 'Show/Hide Completed',
  Purge = 'Remove Completed Tasks',
  Quite = 'Quit',
}

async function promptAdd(): Promise<void> {
  console.clear();
  const answers = await inquirer.prompt({
    type: 'input',
    name: 'add',
    message: 'Enter Task:',
  });
  if (answers['add'] !== '') {
    colletion.addTask(answers['add']);
  }
  promptuser();
}

async function promptComplete(): Promise<void> {
  console.clear();
  const answers = await inquirer.prompt({
    type: 'checkbox',
    name: 'complete',
    message: 'Mark Task Complete',
    choices: colletion.getTaskItems(showCompleted).map((item) => ({
      name: item.task,
      value: item.id,
      checked: item.complete,
    })),
  });

  let completedTasks = answers['complete'] as number[];
  colletion
    .getTaskItems(true)
    .forEach((item) =>
      colletion.markComplete(
        item.id,
        completedTasks.find((id) => id === item.id) != undefined
      )
    );
  promptuser();
}

async function promptuser() {
  console.clear();
  displayTaskList();

  const answers = await inquirer.prompt({
    type: 'list',
    name: 'command',
    message: 'Choose Option',
    choices: Object.values(Commands),
  });
  switch (answers['command']) {
    case Commands.Toggle:
      showCompleted = !showCompleted;
      promptuser();
      break;
    case Commands.Add:
      promptAdd();
      break;
    case Commands.Complete:
      if (colletion.getTaskCounts().incomplete > 0) {
        promptComplete();
      } else {
        promptuser();
      }
      break;
    case Commands.Purge:
      colletion.removeComplete();
      promptuser();
      break;
  }
}
promptuser();
