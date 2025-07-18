# API Documentation

---

# Quotations

## 1. Quotation Verification API

### Overview

This API endpoint verifies a quotation document by decrypting a verification id and validating its existence.

### Endpoint

`GET /api/verify/document/quotation/:id`

### Request Parameters

- `id` (string, required): The encrypted quotation id.

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "quotationStatus": "active",
    "quotationNumber": "Q250213994",
    "issueDate": "02 Feb, 2025"
  }
}
```

OR if the quotation is `expired`:

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "quotationStatus": "expired",
    "quotationNumber": "Q250213991",
    "issueDate": "01 Jan, 2025"
  }
}
```

#### Error Responses

#### Invalid Verification Key

**Status Code: 400 Bad Request**

```json
{
  "status": false,
  "message": "Invalid verification key."
}
```

##### Invalid Quotation id

**Status Code: 400 Bad Request**

```json
{
  "status": false,
  "message": "Invalid quotation Id."
}
```

##### Quotation Not Found

**Status Code: 404 Not Found**

```json
{
  "status": false,
  "message": "Quotation does not exist."
}
```

##### Internal Server Error

**Status Code: 500 Internal Server Error**

```json
{
  "status": false,
  "message": "Something went wrong"
}
```

---

# Daily Tasks Reporting

## 1. Create New Task

### Overview

This endpoint allows users to create a new task within the task management system. The request requires specific details about the task being added, including its name, details, status, and associated subtasks.

### Endpoint

`POST /api/tasks`

### Request Body

```json
{
  "userId": 1,
  "newTask": {
    "userId": 1,
    "taskName": "Task 1",
    "taskDetails": "Details for task 1",
    "comments": "Some comment 1",
    "status": "Pending",
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1746706416000,
    "priority": "High",
    "subTasks": [
      {
        "userId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": "In-Progress",
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000
      },
      {
        "userId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": "Pending",
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000
      }
    ]
  }
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "taskId": 5,
    "userId": 1,
    "statusId": 1,
    "priorityId": 2,
    "taskName": "Task 1",
    "taskDetails": "Details for task 1",
    "comments": "Some comment 1",
    "taskLocked": false,
    "status": {
      "id": 1,
      "status": "Pending"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1750949768814,
    "priority": {
      "id": 2,
      "priority": "High"
    },
    "subTasks": [
      {
        "subTaskId": 1,
        "taskId": 5,
        "statusId": 2,
        "priorityId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": {
          "id": 2,
          "status": "In-Progress"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1800,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      },
      {
        "subTaskId": 2,
        "taskId": 5,
        "statusId": 1,
        "priorityId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": {
          "id": 1,
          "status": "Pending"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 2400,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      }
    ]
  }
}
```

---

## 2. Get Current Month Tasks

### Overview

This API endpoint verifies a quotation document by decrypting a verification id and validating its existence.

### Endpoint

`GET /api/tasks?t={timestamp}`

### Request Parameters

- `t` (timestamp, required): Client time in milliseconds

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "user": {
      "userId": 1,
      "co_user_id": "ESUL0225001",
      "firstName": "Usaama",
      "lastName": "Nkangi",
      "otherName": null,
      "email": "se.usaama@edmartsystems.com",
      "email_verified": 1,
      "phone_number": "+256750781781",
      "phone_verified": 1,
      "profile_picture": "https://avatars.githubusercontent.com/u/81554809?s=400&u=cec5338883a3e0431fbfadea3e3958124d412fee&v=4",
      "status_id": 1,
      "status_reason": null,
      "role_id": 1,
      "signed": 1,
      "created_at": "2025-02-20T07:06:19.646Z",
      "updated_at": "2025-02-20T10:07:52.197Z",
      "role": {
        "role_id": 1,
        "role": "manager"
      },
      "status": {
        "status_id": 1,
        "status": "active"
      }
    },
    "details": {
      "from": 1746347688000,
      "to": 1746866088000
    },
    "tasks": {
      "Sun 04 May, 2025": [],
      "Mon 05 May, 2025": [],
      "Tue 06 May, 2025": [],
      "Wed 07 May, 2025": [],
      "Thu 08 May, 2025": [
        {
          "taskId": 1,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 3600,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 2,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750946207363,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 4,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949685067,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 5,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949768814,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": [
            {
              "subTaskId": 1,
              "taskId": 5,
              "statusId": 2,
              "priorityId": null,
              "taskName": "Subtask A for task 1",
              "taskDetails": "Details for subtask A of task 1",
              "comments": "Initial notes",
              "status": {
                "id": 2,
                "status": "In-Progress"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 1800,
              "priority": null
            },
            {
              "subTaskId": 2,
              "taskId": 5,
              "statusId": 1,
              "priorityId": null,
              "taskName": "Subtask B for task 1",
              "taskDetails": "Details for subtask B of task 1",
              "comments": "Second phase",
              "status": {
                "id": 1,
                "status": "Pending"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 2400,
              "priority": null
            }
          ]
        },
        {
          "taskId": 6,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949782692,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": [
            {
              "subTaskId": 3,
              "taskId": 6,
              "statusId": 2,
              "priorityId": null,
              "taskName": "Subtask A for task 1",
              "taskDetails": "Details for subtask A of task 1",
              "comments": "Initial notes",
              "status": {
                "id": 2,
                "status": "In-Progress"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 1800,
              "priority": null
            },
            {
              "subTaskId": 4,
              "taskId": 6,
              "statusId": 1,
              "priorityId": null,
              "taskName": "Subtask B for task 1",
              "taskDetails": "Details for subtask B of task 1",
              "comments": "Second phase",
              "status": {
                "id": 1,
                "status": "Pending"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 2400,
              "priority": null
            }
          ]
        }
      ],
      "Fri 09 May, 2025": [],
      "Sat 10 May, 2025": []
    }
  }
}
```

---

## 3. Get Tasks in a Date Range

### Overview

This endpoint retrieves tasks for a specific user within a defined date range.

### Endpoint

`POST /api/tasks/range?f={from_timestamp}&t={to_timestamp}`

### Request Parameters

- `f` (timestamp, required): The start time of the date range time in milliseconds.
- `t` (timestamp, required): The end time of the date range time in milliseconds.

### Request Body

```json
{
  "userId": 1
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "user": {
      "userId": 1,
      "co_user_id": "ESUL0225001",
      "firstName": "Usaama",
      "lastName": "Nkangi",
      "otherName": null,
      "email": "se.usaama@edmartsystems.com",
      "email_verified": 1,
      "phone_number": "+256750781781",
      "phone_verified": 1,
      "profile_picture": "https://avatars.githubusercontent.com/u/81554809?s=400&u=cec5338883a3e0431fbfadea3e3958124d412fee&v=4",
      "status_id": 1,
      "status_reason": null,
      "role_id": 1,
      "signed": 1,
      "created_at": "2025-02-20T07:06:19.646Z",
      "updated_at": "2025-02-20T10:07:52.197Z",
      "role": {
        "role_id": 1,
        "role": "manager"
      },
      "status": {
        "status_id": 1,
        "status": "active"
      }
    },
    "details": {
      "from": 1746347688000,
      "to": 1746866088000
    },
    "tasks": {
      "Sun 04 May, 2025": [],
      "Mon 05 May, 2025": [],
      "Tue 06 May, 2025": [],
      "Wed 07 May, 2025": [],
      "Thu 08 May, 2025": [
        {
          "taskId": 1,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 3600,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 2,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750946207363,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 4,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949685067,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": []
        },
        {
          "taskId": 5,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949768814,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": [
            {
              "subTaskId": 1,
              "taskId": 5,
              "statusId": 2,
              "priorityId": null,
              "taskName": "Subtask A for task 1",
              "taskDetails": "Details for subtask A of task 1",
              "comments": "Initial notes",
              "status": {
                "id": 2,
                "status": "In-Progress"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 1800,
              "priority": null
            },
            {
              "subTaskId": 2,
              "taskId": 5,
              "statusId": 1,
              "priorityId": null,
              "taskName": "Subtask B for task 1",
              "taskDetails": "Details for subtask B of task 1",
              "comments": "Second phase",
              "status": {
                "id": 1,
                "status": "Pending"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 2400,
              "priority": null
            }
          ]
        },
        {
          "taskId": 6,
          "userId": 1,
          "statusId": 1,
          "priorityId": 2,
          "taskName": "Task 1",
          "taskDetails": "Details for task 1",
          "comments": "Some comment 1",
          "taskLocked": false,
          "status": {
            "id": 1,
            "status": "Pending"
          },
          "startTime": 1746663216000,
          "endTime": 1746706416000,
          "time": 1750949782692,
          "priority": {
            "id": 2,
            "priority": "High"
          },
          "subTasks": [
            {
              "subTaskId": 3,
              "taskId": 6,
              "statusId": 2,
              "priorityId": null,
              "taskName": "Subtask A for task 1",
              "taskDetails": "Details for subtask A of task 1",
              "comments": "Initial notes",
              "status": {
                "id": 2,
                "status": "In-Progress"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 1800,
              "priority": null
            },
            {
              "subTaskId": 4,
              "taskId": 6,
              "statusId": 1,
              "priorityId": null,
              "taskName": "Subtask B for task 1",
              "taskDetails": "Details for subtask B of task 1",
              "comments": "Second phase",
              "status": {
                "id": 1,
                "status": "Pending"
              },
              "startTime": 1746663216000,
              "endTime": 1746706416000,
              "time": 2400,
              "priority": null
            }
          ]
        }
      ],
      "Fri 09 May, 2025": [],
      "Sat 10 May, 2025": []
    }
  }
}
```

---

## 4. Delete Task

### Overview

This endpoint allows you to delete a specific task by its taskId.

### Endpoint

`DELETE /api/tasks/{taskId}`

### Request Parameters

- `taskId` (number, required): The Id of the task to be deleted.

### Request Body

```json
{
  "userId": 1,
  "taskId": 5
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "taskId": 5,
    "userId": 1,
    "statusId": 1,
    "priorityId": 2,
    "taskName": "Task 1",
    "taskDetails": "Details for task 1",
    "comments": "Some comment 1",
    "taskLocked": false,
    "status": {
      "id": 1,
      "status": "Pending"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1750949768814,
    "priority": {
      "id": 2,
      "priority": "High"
    },
    "subTasks": [
      {
        "subTaskId": 1,
        "taskId": 5,
        "statusId": 2,
        "priorityId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": {
          "id": 2,
          "status": "In-Progress"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1800,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      },
      {
        "subTaskId": 2,
        "taskId": 5,
        "statusId": 1,
        "priorityId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": {
          "id": 1,
          "status": "Pending"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 2400,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      }
    ]
  }
}
```

---

## 5. Update Task

### Overview

This endpoint allows you to update an existing task by its taskId.

### Endpoint

`PUT /api/tasks/{taskId}`

### Request Parameters

- `taskId` (number, required): The Id of the task to be updated.

### Request Body

```json
{
  "userId": 1,
  "taskData": {
    "userId": 1,
    "taskId": 5,
    "priorityStr": "New Task Priority",
    "taskName": "New Task Name",
    "taskDetails": "New Task Details"
  }
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "taskId": 5,
    "userId": 1,
    "statusId": 1,
    "priorityId": 2,
    "taskName": "New Task Name",
    "taskDetails": "New Task Details",
    "comments": "Some comment 1",
    "taskLocked": false,
    "status": {
      "id": 1,
      "status": "Pending"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1750949768814,
    "priority": {
      "id": 2,
      "priority": "High"
    },
    "subTasks": [
      {
        "subTaskId": 1,
        "taskId": 5,
        "statusId": 2,
        "priorityId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": {
          "id": 2,
          "status": "In-Progress"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      },
      {
        "subTaskId": 2,
        "taskId": 5,
        "statusId": 1,
        "priorityId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": {
          "id": 1,
          "status": "Pending"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      }
    ]
  }
}
```

---

## 6. Add Subtasks To Task

### Overview

This endpoint allows users to add new subtasks to an existing task. It is designed to facilitate the organization and management of tasks by allowing users to break down larger tasks into smaller, manageable subtasks.

### Endpoint

`POST /api/tasks/subtasks`

### Request Body

```json
{
  "userId": 1,
  "taskId": 5,
  "newSubTasks": [
    {
      "taskId": 4,
      "userId": 1,
      "taskName": "Entered Subtask B",
      "taskDetails": "Entered Details for subtask B",
      "comments": "Initial notes",
      "status": "In-Progress",
      "startTime": 1746663216000,
      "endTime": 1746706416000,
      "time": 1746706416000
    },
    {
      "taskId": 4,
      "userId": 1,
      "taskName": "Subtask B for task 1",
      "taskDetails": "Details for subtask B of task 1",
      "comments": "Second phase",
      "status": "Pending",
      "startTime": 1746663216000,
      "endTime": 1746706416000,
      "time": 1746706416000
    }
  ]
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "taskId": 5,
    "userId": 1,
    "statusId": 1,
    "priorityId": 2,
    "taskName": "Task 1",
    "taskDetails": "Details for task 1",
    "comments": "Some comment 1",
    "taskLocked": false,
    "status": {
      "id": 1,
      "status": "Pending"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1750949768814,
    "priority": {
      "id": 2,
      "priority": "High"
    },
    "subTasks": [
      {
        "subTaskId": 1,
        "taskId": 5,
        "statusId": 2,
        "priorityId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": {
          "id": 2,
          "status": "In-Progress"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      },
      {
        "subTaskId": 2,
        "taskId": 5,
        "statusId": 1,
        "priorityId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": {
          "id": 1,
          "status": "Pending"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      }
    ]
  }
}
```

---

## 7. Delete Subtask

### Overview

This endpoint is used to delete a specific subtask associated with a task.

### Endpoint

`DELETE /api/tasks/subtasks/{subtaskId}`

### Request Parameters

- `subtaskId` (number, required): The Id of the subtask to be deleted.

### Request Body

```json
{
  "userId": 1,
  "taskId": 5,
  "subTaskId": 8
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "subTaskId": 8,
    "taskId": 5,
    "statusId": 2,
    "priorityId": 1,
    "taskName": "Subtask A for task 1",
    "taskDetails": "Details for subtask A of task 1",
    "comments": "Initial notes",
    "status": {
      "id": 2,
      "status": "In-Progress"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1746706416000,
    "priority": {
      "id": 2,
      "priority": "High"
    }
  }
}
```

---

## 8. Update Subtask

### Overview

This endpoint allows you to update an existing task by its taskId.

### Endpoint

`PUT /api/tasks/subtasks/{subtaskId}`

### Request Parameters

- `subtaskId` (number, required): The Id of the sub task to be updated.

### Request Body

```json
{
  "userId": 1,
  "subTaskData": {
    "userId": 1,
    "taskId": 5,
    "subTaskId": 8,
    "priorityStr": "New subtask Priority",
    "taskName": "New subtask Name",
    "taskDetails": "New subtask Details"
  }
}
```

### Response

#### Success Response

**Status Code: 200 OK**

```json
{
  "status": true,
  "message": "Successful",
  "data": {
    "taskId": 5,
    "userId": 1,
    "statusId": 1,
    "priorityId": 2,
    "taskName": "New Task Name",
    "taskDetails": "New Task Details",
    "comments": "Some comment 1",
    "taskLocked": false,
    "status": {
      "id": 1,
      "status": "Pending"
    },
    "startTime": 1746663216000,
    "endTime": 1746706416000,
    "time": 1750949768814,
    "priority": {
      "id": 2,
      "priority": "High"
    },
    "subTasks": [
      {
        "subTaskId": 1,
        "taskId": 5,
        "statusId": 2,
        "priorityId": 1,
        "taskName": "Subtask A for task 1",
        "taskDetails": "Details for subtask A of task 1",
        "comments": "Initial notes",
        "status": {
          "id": 2,
          "status": "In-Progress"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      },
      {
        "subTaskId": 8,
        "taskId": 5,
        "statusId": 1,
        "priorityId": 1,
        "taskName": "Subtask B for task 1",
        "taskDetails": "Details for subtask B of task 1",
        "comments": "Second phase",
        "status": {
          "id": 1,
          "status": "Pending"
        },
        "startTime": 1746663216000,
        "endTime": 1746706416000,
        "time": 1746706416000,
        "priority": {
          "id": 2,
          "priority": "High"
        }
      }
    ]
  }
}
```

---
