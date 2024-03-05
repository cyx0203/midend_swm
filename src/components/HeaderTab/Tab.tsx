import type { MouseEvent } from 'react';
import type { CachingNode } from 'react-activation';
// import { useMemo } from 'react';
import { useHistory, useLocation, useAliveController } from 'umi';
import { Menu, Dropdown } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
// import { compose, filter, last, eq, prop } from 'lodash/fp';
import { add, compose, filter, findIndex, forEach } from 'lodash/fp';
import classnames from 'classnames';

import styles from './index.module.less';

enum MenuEnum {
  关闭,
  关闭其他,
  关闭右侧,
}

const excludeNumber = ([_, v]) => typeof v !== 'number';
const toObject = ([i, v]) => ({ label: v, key: i });

const inc = add(1);

const menu = Object.entries(MenuEnum).filter(excludeNumber).map(toObject);

export interface CachingNode_Z extends CachingNode {
  name: string;
}

interface HeaderTabProps {
  child: CachingNode_Z;
  persistant?: boolean;
}

// const _key = Math.random();
// window[module.id] = _key;

// const predicate = s => n => !eq(s, prop('name'));

// const eject = (n: string) => compose(prop('path'), last, filter(predicate));

export default function Tab({ child, persistant }: HeaderTabProps) {
  const history = useHistory();
  const location = useLocation();
  const { getCachingNodes, dropScope } = useAliveController();

  const inCache = getCachingNodes();

  // const closable = location.pathname !== child.path && inCache.length > 1;
  const closable = inCache.length > 1 && !persistant;
  const lessThan2 = inCache.length < 2;
  const isTheLastOne = [...inCache].pop().name === child.name;

  async function dropTab(e?: MouseEvent<HTMLSpanElement>) {
    e?.stopPropagation();
    const currentName = child.name;

    if (location.pathname === child.path) {
      dropScope(currentName);

      // const next1 = eject(currentName)(inCache);
      const next = inCache.filter(v => v.name !== currentName).pop().path;

      history.push(next);
    } else {
      dropScope(currentName);
    }
  }

  const onMenuItemSelect = ({ key }) => {
    const p = v => v.id !== child.id && !v.persistant;
    const u = v => dropScope(v.name);
    const y = v => v.id === child.id;

    switch (+key) {
      case MenuEnum.关闭:
        dropTab();
        break;
      case MenuEnum.关闭其他:
        {
          const f = compose(forEach(u), filter(p));
          f(inCache);
        }
        break;
      case MenuEnum.关闭右侧:
        {
          const s = i => inCache.slice(inc(i));
          const f = compose(forEach(u), s, findIndex(y));
          f(inCache);
        }
        break;
      default:
        break;
    }
  };

  const renderContextMenu = () => {
    let _menu = JSON.parse(JSON.stringify(menu)) as typeof menu;

    if (persistant) {
      _menu = _menu.map(v => (+v.key === MenuEnum.关闭 ? { ...v, disabled: true } : v));
    }

    if (isTheLastOne) {
      _menu = _menu.map(v => (+v.key === MenuEnum.关闭右侧 ? { ...v, disabled: true } : v));
    }

    if (lessThan2) {
      _menu = _menu.map(v => ({ ...v, disabled: true }));
    }

    return _menu;
  };

  return (
    <Dropdown
      trigger={['contextMenu']}
      overlay={<Menu items={renderContextMenu()} onClick={onMenuItemSelect} />}
    >
      <li
        className={classnames({
          [styles.active]: location.pathname === child.path,
        })}
        onClick={() => history.push(child.path)}
      >
        {child.name}
        {closable && <CloseCircleOutlined className={styles['close-btn']} onClick={dropTab} />}
      </li>
    </Dropdown>
  );
}

Tab.defaultProps = {
  persistant: false,
};
