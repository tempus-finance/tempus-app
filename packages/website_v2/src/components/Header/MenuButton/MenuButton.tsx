/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { FC, useCallback, useRef } from 'react';

import './MenuButton.scss';

interface MenuButtonProps {
  checked: boolean;
  color: 'dark' | 'light';
  onChange: (checked: boolean) => void;
}

const MenuButton: FC<MenuButtonProps> = (props): JSX.Element => {
  const { checked, color, onChange } = props;

  const checkboxRef = useRef<HTMLInputElement>(null);

  const onCheckboxClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
  }, []);

  const onWrapperClick = useCallback(() => {
    if (checkboxRef.current) {
      checkboxRef.current.checked = !checkboxRef.current.checked;

      onChange(checkboxRef.current.checked);
    }
  }, [onChange]);

  return (
    <div className="tw__menuButton-wrapper" onClick={onWrapperClick}>
      <div className="tw__menuButton">
        <input type="checkbox" id="menu-button" checked={checked} ref={checkboxRef} onClick={onCheckboxClick} />
        <label htmlFor="menu-button" className={`tw__menuButton-${color}`} />
      </div>
    </div>
  );
};
export default MenuButton;
