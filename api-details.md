# Dev Tinder Project APi Details

## Auth Router
--POST/signup
--POST/login
--POST/logout

## Profile Router
--GET/profile/view
--PATCH/profile/edit
--PATCH/profile/password

## Connection Request Router (Status:interested,ignored,accepted,rejected)
--POST/request/send/interested/:userId
--POST/request/send/ignored/:userId
--POST/request/review/accepted/:requestId
--POST/request/review/rejected/:requestId

## User Router
--GET/users/connection
--GET/users/request/recived
--GET/users/feed