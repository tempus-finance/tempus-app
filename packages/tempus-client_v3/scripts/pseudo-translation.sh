#!/bin/sh
sed -i -E 's/"(.+)": ""/"\1": "~~~~~====={{{{{(((((\1)))))}}}}}=====~~~~~"/g' src/i18n/translations/zz.json
