import express from 'express';

import blobs from './controllers/blobs';
// import cellularAutomata from './controllers/cellular-automata';

const logger = require('./utils/logger')();

const app = express();

app.get('/blobs', (req, res) => blobs(req, res));

// app.get('/cellular-automata', (req, res) => {
//   res.send(cellularAutomata);
// });

app.listen(3010, () => {
  logger.log(`
:::    ::: :::::::::: :::    :::     :::     ::::::::: :::::::::
:+:    :+: :+:        :+:    :+:   :+: :+:   :+:    :+:   :+:
+:+    +:+ +:+         +:+  +:+   +:+   +:+  +:+    +:+   +:+
+#++:++#++ +#++:++#     +#++:+   +#++:++#++: +#++:++#+    +#+
+#+    +#+ +#+         +#+  +#+  +#+     +#+ +#+          +#+
#+#    #+# #+#        #+#    #+# #+#     #+# #+#          #+#
###    ### ########## ###    ### ###     ### ###       #########`);
  logger.log('Server running at 3010');
});
