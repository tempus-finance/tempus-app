#!/bin/sh
TRANSLATION_FILE=src/i18n/translations/zz.json
sed -i.bak -E 's/"(.+)": ""/"\1": "~~~~~====={{{{{(((((\1)))))}}}}}=====~~~~~"/g' $TRANSLATION_FILE && rm "${TRANSLATION_FILE}.bak"