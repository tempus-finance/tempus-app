# Icon

### Usage
If you are looking for a `up-chevron` icon, you can either:
```
import Icon from './components/shared/Icon';
...
return <Icon type="up-chevron" />;
```
or
```
import UpChevronIcon from './components/shared/UpChevron';
...
return <UpChevronIcon />;
```

### Props
You may refer to `IconProps`
| Name | Type | Default | Description |
| ----------- | ----------- | ----------- | ----------- |
| type | `IconType` | --- | require for `<Icon>` for specifying which icon to be used |
| size? | "large" \| "medium" \| "small" \| number | "medium" | Width and height of the `Icon`. "large" = 24, "medium" = 16, "small" = 12. You can also provide the actual size, e.g. 48.|