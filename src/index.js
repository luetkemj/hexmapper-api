import express from 'express';

const logger = require('./utils/logger')();

const app = express();

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(3010, () => {
  console.log('bunnC');
  logger.log('bunn');
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
